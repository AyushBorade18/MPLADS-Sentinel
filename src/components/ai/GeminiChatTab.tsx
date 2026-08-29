import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  RotateCcw,
  Cpu,
  ShieldAlert,
  Compass,
  FileCheck2,
  Info,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { aiService, ChatMessage, GeminiModelType, ChatHistoryItem } from '../../services/aiService';

const MODEL_OPTIONS: Array<{ id: GeminiModelType; name: string; tag: string; description: string; badgeColor: string }> = [
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    tag: 'Standard Auditor',
    description: 'Fast, highly balanced reasoning for general scheme inquiries and ledger summaries.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    tag: 'Complex Forensic Reasoning',
    description: 'Deep mathematical auditing, cross-district collusion analysis, and statutory anomaly forensics.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    tag: 'Ultra-Fast Verification',
    description: 'Near-instant response latency for quick ID lookups, status queries, and budget math.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
];

const ROLES = [
  {
    id: 'forensic',
    name: 'Forensic Audit Lead',
    icon: ShieldAlert,
    instruction:
      'You are the Senior Forensic Auditor for MoSPI MPLADS. Conduct rigorous anomaly detection on vendor bidding, cost escalations, unspent funds, and milestone delays. Highlight red flags with statutory references.',
  },
  {
    id: 'gis',
    name: 'GIS & Field Verifier',
    icon: Compass,
    instruction:
      'You are the GIS Verification & Satellite Spatial Analyst for MPLADS schemes. Focus on geotagging compliance, physical milestone photographic validation, and spatial proximity checks.',
  },
  {
    id: 'compliance',
    name: 'MoSPI Compliance Officer',
    icon: FileCheck2,
    instruction:
      'You are the MoSPI Regulatory Compliance Officer. Interpret the MPLADS Revised Guidelines 2023, permissible vs prohibited works, district authority powers, and utilization certificate norms.',
  },
];

const SUGGESTED_QUERIES = [
  'Analyze contractor bid concentration patterns across Bihar healthcare projects',
  'Summarize MPLADS fund utilization velocity for FY 2023-24',
  'What are the permissible guidelines for installing solar micro-grids under MPLADS?',
  'Why was project PRJ-2023-4921 flagged for 3.8x vendor concentration risk?',
];

export const GeminiChatTab: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('gemini-3.5-flash');
  const [selectedRole, setSelectedRole] = useState(ROLES[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      modelUsed: 'gemini-3.5-flash',
      content:
        '### 🛡️ Sentinel Forensic Intelligence Suite Active\n\nWelcome to the multi-turn Gemini investigative console. I can analyze 4,520+ national MPLADS projects, detect bidding irregularities, cross-reference contractors, and audit scheme guidelines.\n\n*Select a query prompt below or enter an investigation query to begin.*',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsgId = `usr-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: textToSend,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    // Format chat history for multi-turn Gemini API
    const historyPayload: ChatHistoryItem[] = newMessages
      .filter((m) => m.id !== 'welcome')
      .slice(-8)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    // Find system instruction for active role
    const activeRoleObj = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

    try {
      const response = await aiService.sendChatMessage(
        textToSend,
        historyPayload,
        selectedModel,
        activeRoleObj.instruction
      );

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: response.text,
        modelUsed: response.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          content: `⚠️ **Audit Error:** Unable to retrieve Gemini response. ${err?.message || 'Check network connection.'}`,
          modelUsed: selectedModel,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTTS = async (msgId: string, text: string) => {
    if (playingAudioId === msgId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingAudioId(null);
      return;
    }

    try {
      setPlayingAudioId(msgId);
      // Clean markdown characters for clearer speech
      const plainText = text.replace(/[*#_`~\[\]]/g, '').slice(0, 800);
      const res = await aiService.generateSpeech(plainText, 'Kore');

      const binary = atob(res.base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setPlayingAudioId(null);
      };
      audio.play();
    } catch (err) {
      console.error('TTS speech playback error:', err);
      setPlayingAudioId(null);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        timestamp: 'Just now',
        modelUsed: selectedModel,
        content: 'Chat session reset. Select a role and ask your investigative query.',
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Top Configuration Bar: Model Selector & Role Persona */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Model Selection */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              GEMINI MODEL ENGINE
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {MODEL_OPTIONS.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500 shadow-2xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{m.name}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <span
                      className={`inline-block mt-1 text-[10px] font-mono px-1.5 py-0.2 rounded border ${m.badgeColor}`}
                    >
                      {m.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Persona / System Role Selection */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              AUDITOR ROLE & PERSPECTIVE
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500 shadow-2xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isSelected ? 'text-indigo-700' : 'text-slate-500'
                        }`}
                      />
                      <span className="text-xs font-bold text-slate-900">{r.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                      {r.id === 'forensic' ? 'Bidding & Collusion' : r.id === 'gis' ? 'Geotagging & Sites' : 'MoSPI Guidelines'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono text-slate-400 font-semibold">SUGGESTIONS:</span>
        {SUGGESTED_QUERIES.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-xs bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-700 px-3 py-1 rounded-full border border-slate-200 shadow-2xs transition-all font-medium disabled:opacity-50"
          >
            {q} &rarr;
          </button>
        ))}
      </div>

      {/* Scrollable Multi-turn Chat Thread */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col h-[560px]">
        {/* Chat Thread Header */}
        <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700 font-display">
              Live Investigation Session
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {selectedModel}
            </span>
          </div>

          <button
            onClick={clearChat}
            className="text-[11px] font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:bg-slate-200/60 px-2 py-1 rounded transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Thread
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-4 transition-all ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                      : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-none shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-current/10">
                    <span className="font-mono text-[10px] opacity-75 font-semibold">
                      {isUser ? 'Auditor Query' : `Sentinel AI • ${msg.modelUsed || selectedModel}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] opacity-60 font-mono">{msg.timestamp}</span>

                      {!isUser && (
                        <>
                          <button
                            onClick={() => handleTTS(msg.id, msg.content)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-blue-600 transition-colors"
                            title={playingAudioId === msg.id ? 'Stop Speech' : 'Play Audio Briefing'}
                          >
                            {playingAudioId === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(msg.id, msg.content)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="markdown-body prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-2xs animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 rounded-tl-none shadow-2xs flex items-center gap-2.5 text-slate-600">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="font-mono text-xs">
                  Querying {selectedModel} forensic engine...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask an audit question, analyze contract anomalies, or cross-examine scheme ledgers..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-lg px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none transition-colors"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Investigate</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
