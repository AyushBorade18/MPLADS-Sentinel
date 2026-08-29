import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  AlertCircle,
  Activity,
  User,
  Bot,
  RefreshCw,
  PhoneCall,
  PhoneOff,
  Headphones,
} from 'lucide-react';
import { aiService } from '../../services/aiService';

// Audio conversion helper: Float32Array (-1.0 to 1.0) to 16-bit PCM little endian base64
function floatTo16BitPCM(input: Float32Array): string {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  let binary = '';
  const bytes = new Uint8Array(output.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const LiveVoiceTab: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('Standby. Click "Start Live Voice Briefing" to connect.');
  const [error, setError] = useState<string | null>(null);
  const [transcriptLog, setTranscriptLog] = useState<Array<{ sender: 'user' | 'model'; text: string; time: string }>>([
    {
      sender: 'model',
      text: 'Sentinel Voice Dispatch ready. Speak directly to query scheme compliance, fund allocations, and risk scores.',
      time: 'Just now',
    },
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  // Stop session
  const stopLiveSession = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsSpeaking(false);
    setIsModelSpeaking(false);
    setStatusText('Session disconnected.');
  };

  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  const startLiveSession = async () => {
    setError(null);
    setStatusText('Requesting microphone & establishing WebSocket stream...');

    try {
      // 1. Get mic stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Setup AudioContexts (16kHz for mic input, 24kHz for model output)
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = inputCtx;

      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // 3. Connect WebSocket to server
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setStatusText('Live Audio Channel Open • Speak into your microphone');

        // Setup microphone processor
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (isMuted) return;
          const inputData = e.inputBuffer.getChannelData(0);

          // Detect user speech energy for visualizer
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += Math.abs(inputData[i]);
          }
          const avg = sum / inputData.length;
          setIsSpeaking(avg > 0.03);

          const b64Audio = floatTo16BitPCM(inputData);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ audio: b64Audio }));
          }
        };
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.error) {
            console.warn('Live API message warning:', msg.error);
            setError(msg.error);
          }

          if (msg.interrupted) {
            setIsModelSpeaking(false);
            if (outputAudioCtxRef.current) {
              nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
            }
          }

          if (msg.audio) {
            setIsModelSpeaking(true);
            playAudioChunk(msg.audio);
          }
        } catch (e) {
          console.error('Error handling WS audio message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('WS Live Error:', err);
        setError('WebSocket live connection failed. Ensure server is active.');
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsModelSpeaking(false);
      };
    } catch (err: any) {
      console.error('Microphone or WS error:', err);
      setError(
        err?.message ||
          'Could not access microphone or connect to Gemini Live API. Please check permissions.'
      );
      stopLiveSession();
    }
  };

  // Play incoming 24kHz PCM audio chunk
  const playAudioChunk = (base64Audio: string) => {
    const ctx = outputAudioCtxRef.current;
    if (!ctx) return;

    try {
      const binary = atob(base64Audio);
      const buffer = new ArrayBuffer(binary.length);
      const view = new DataView(buffer);
      for (let i = 0; i < binary.length; i++) {
        view.setUint8(i, binary.charCodeAt(i));
      }

      const numSamples = binary.length / 2;
      const audioBuffer = ctx.createBuffer(1, numSamples, 24000);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < numSamples; i++) {
        const int16 = view.getInt16(i * 2, true);
        channelData[i] = int16 / 32768;
      }

      const sourceNode = ctx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }

      sourceNode.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;

      sourceNode.onended = () => {
        if (ctx.currentTime >= nextStartTimeRef.current - 0.05) {
          setIsModelSpeaking(false);
        }
      };
    } catch (e) {
      console.error('Audio chunk decoding error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Radio className="w-3 h-3 text-rose-600 animate-pulse" />
            Gemini 3.1 Flash Live Preview • Real-Time Voice API
          </div>
          <h2 className="text-lg font-bold font-display text-slate-900">
            Live Voice Audit Briefing & Hands-Free Investigation
          </h2>
          <p className="text-xs text-slate-600">
            Real-time, ultra-low-latency two-way conversational voice channel for on-site field auditors and district magistrates.
          </p>
        </div>
      </div>

      {/* Voice Room Stage */}
      <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 text-white shadow-lg relative overflow-hidden flex flex-col items-center justify-center text-center space-y-6 min-h-[420px]">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Central Audio Visualizer Orb */}
        <div className="relative">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              isModelSpeaking
                ? 'bg-rose-500/20 ring-8 ring-rose-500/30 scale-110 shadow-[0_0_50px_rgba(244,63,94,0.5)]'
                : isSpeaking
                ? 'bg-blue-500/20 ring-8 ring-blue-500/30 scale-105 shadow-[0_0_40px_rgba(59,130,246,0.4)]'
                : isConnected
                ? 'bg-emerald-500/15 ring-4 ring-emerald-500/20'
                : 'bg-slate-800 ring-2 ring-slate-700'
            }`}
          >
            {isModelSpeaking ? (
              <Volume2 className="w-12 h-12 text-rose-400 animate-bounce" />
            ) : isSpeaking ? (
              <Mic className="w-12 h-12 text-blue-400 animate-pulse" />
            ) : isConnected ? (
              <Headphones className="w-12 h-12 text-emerald-400" />
            ) : (
              <MicOff className="w-12 h-12 text-slate-500" />
            )}
          </div>

          {/* Pulsing rings when connected */}
          {isConnected && (
            <div className="absolute -inset-4 border border-rose-500/30 rounded-full animate-ping pointer-events-none opacity-40" />
          )}
        </div>

        {/* Dynamic Status Text */}
        <div className="space-y-1.5 max-w-md">
          <div className="text-sm font-bold font-mono tracking-wide uppercase text-slate-200">
            {isModelSpeaking
              ? '🔊 Gemini Live Responding...'
              : isSpeaking
              ? '🎙️ Listening to Auditor Voice...'
              : isConnected
              ? '🟢 Channel Live • Speak any inquiry'
              : '🔴 Standby'}
          </div>
          <p className="text-xs text-slate-400">{statusText}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <button
              onClick={startLiveSession}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full flex items-center gap-2 shadow-md transition-all scale-100 hover:scale-105"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Connect Live Voice Channel</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isMuted
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
              </button>

              <button
                onClick={stopLiveSession}
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-full flex items-center gap-2 transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-200 text-xs flex items-center gap-2 max-w-md text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Tech Specs */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-400">
          <span>Format: 16-bit PCM Little Endian</span>
          <span>•</span>
          <span>Mic Input: 16,000 Hz</span>
          <span>•</span>
          <span>Output Playback: 24,000 Hz</span>
          <span>•</span>
          <span>Model: gemini-3.1-flash-live-preview</span>
        </div>
      </div>
    </div>
  );
};
