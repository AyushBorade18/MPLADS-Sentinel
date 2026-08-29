import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Play,
  Pause,
  Upload,
  Download,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Video,
  Clapperboard,
  RotateCcw,
  Maximize2,
} from 'lucide-react';
import { aiService } from '../../services/aiService';

const SAMPLE_VEO_IMAGES = [
  {
    name: 'Rural Bridge Construction',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?auto=format&fit=crop&w=600&q=80',
    prompt: 'Drone flyover moving forward across the rural bridge construction site with workers actively surveying the concrete deck',
  },
  {
    name: 'Primary Health Center',
    url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80',
    prompt: 'Cinematic 360 degree aerial orbit around the completed healthcare building showcasing new rooftop solar installation',
  },
  {
    name: 'Gram Panchayat Hall',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
    prompt: 'Smooth crane camera descent from the sky down into the entrance of the newly built community civic center',
  },
];

const REASSURING_MESSAGES = [
  'Initiating neural physics simulation on Veo cluster...',
  'Calculating 3D camera trajectory and lighting geometry...',
  'Rendering volumetric shadows and temporal consistency across frames...',
  'Synthesizing structural motion vectors for site inspection...',
  'Finalizing high-definition MP4 encoding and color grading...',
];

export const VeoVideoTab: React.FC = () => {
  const [prompt, setPrompt] = useState('Cinematic aerial drone flyover inspection of the project site with smooth 4K motion');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Generation status
  const [loading, setLoading] = useState(false);
  const [progressMsgIndex, setProgressMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const pollIntervalRef = useRef<any>(null);

  useEffect(() => {
    let timer: any;
    if (loading) {
      timer = setInterval(() => {
        setProgressMsgIndex((prev) => (prev + 1) % REASSURING_MESSAGES.length);
      }, 4500);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setImageBase64(b64);
      setImagePreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sample: typeof SAMPLE_VEO_IMAGES[0]) => {
    try {
      setImagePreview(sample.url);
      setPrompt(sample.prompt);
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to load sample image:', err);
    }
  };

  const handleStartGeneration = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setProgressMsgIndex(0);

    try {
      // 1. Start generation
      const startRes = await aiService.startVideoGeneration(
        prompt,
        imageBase64 || undefined,
        aspectRatio,
        resolution
      );

      const opName = startRes.operationName;

      // 2. Poll until done
      const checkPoll = async () => {
        try {
          const statusRes = await aiService.pollVideoStatus(opName);
          if (statusRes.done) {
            if (statusRes.error) {
              throw new Error(statusRes.error.message || 'Video generation failed on server.');
            }

            // 3. Download video blob
            const videoBlob = await aiService.downloadVideoBlob(opName);
            const objectUrl = URL.createObjectURL(videoBlob);
            setVideoUrl(objectUrl);
            setLoading(false);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          }
        } catch (err: any) {
          console.error('Polling error:', err);
          setError(err?.message || 'Video generation error during polling.');
          setLoading(false);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      };

      pollIntervalRef.current = setInterval(checkPoll, 5000);
      // Run first check after 4s
      setTimeout(checkPoll, 4000);
    } catch (err: any) {
      console.error('Start video gen error:', err);
      setError(err?.message || 'Failed to initiate Veo video generation.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clapperboard className="w-3 h-3 text-amber-600" />
            Veo Video Generation • veo-3.1-fast-generate-preview
          </div>
          <h2 className="text-lg font-bold font-display text-slate-900">
            Photorealistic Site Inspection & Aerial Drone Video Studio
          </h2>
          <p className="text-xs text-slate-600">
            Convert still photographic milestones into continuous drone flyovers and 3D architectural walk-throughs using Google Veo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            {/* Step 1: Upload / Choose Starting Image */}
            <div className="space-y-3 pb-3 border-b border-slate-100">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                1. STARTING PHOTO (IMAGE-TO-VIDEO)
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-lg p-3 text-center cursor-pointer bg-slate-50 hover:bg-amber-50/30 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <div className="text-xs font-semibold text-slate-700">
                  {imagePreview ? 'Replace Photo' : 'Upload Milestone Photo'}
                </div>
                <div className="text-[10px] text-slate-400">JPG, PNG for frame-0 seed</div>
              </div>

              {/* Sample Images */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-semibold block mb-1">
                  OR USE AUDITED SITE SEED:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_VEO_IMAGES.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSample(s)}
                      className={`rounded-lg overflow-hidden border cursor-pointer relative aspect-video ${
                        imagePreview === s.url
                          ? 'border-amber-500 ring-2 ring-amber-300'
                          : 'border-slate-200 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={s.url} alt={s.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                        <span className="text-[9px] text-white truncate font-medium">{s.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Camera & Motion Prompt */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                2. MOTION & INSPECTION PROMPT
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe drone camera motion, site activity, lighting..."
                className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none transition-colors"
              />
            </div>

            {/* Step 3: Aspect Ratio (16:9 landscape or 9:16 portrait) */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                  ASPECT RATIO
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`py-1.5 text-xs font-mono font-semibold rounded border text-center transition-all ${
                      aspectRatio === '16:9'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    16:9 Wide
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`py-1.5 text-xs font-mono font-semibold rounded border text-center transition-all ${
                      aspectRatio === '9:16'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    9:16 Tall
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                  RESOLUTION
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setResolution('720p')}
                    className={`py-1.5 text-xs font-mono font-semibold rounded border text-center transition-all ${
                      resolution === '720p'
                        ? 'bg-slate-800 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    720p
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolution('1080p')}
                    className={`py-1.5 text-xs font-mono font-semibold rounded border text-center transition-all ${
                      resolution === '1080p'
                        ? 'bg-slate-800 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    1080p
                  </button>
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <button
              type="button"
              onClick={handleStartGeneration}
              disabled={loading || !prompt.trim()}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Veo Video...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>Generate Veo 3D Inspection Video</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Video Player / Canvas Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs min-h-[460px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold font-display text-slate-900 flex items-center gap-2">
                  <Video className="w-4 h-4 text-amber-600" />
                  Veo Motion Player & Inspection Artifact
                </h3>

                {videoUrl && (
                  <a
                    href={videoUrl}
                    download={`veo-inspection-${Date.now()}.mp4`}
                    className="text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded border border-amber-200 flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download MP4
                  </a>
                )}
              </div>

              {/* Viewport */}
              <div className="mt-4 flex items-center justify-center">
                {loading ? (
                  <div className="w-full h-80 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                      <Film className="w-6 h-6 text-amber-400 absolute inset-0 m-auto" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <div className="text-sm font-bold text-white">
                        Veo 3.1 Neural Video Generation Active
                      </div>
                      <div className="text-xs text-amber-300/90 font-mono transition-all">
                        {REASSURING_MESSAGES[progressMsgIndex]}
                      </div>
                      <div className="text-[11px] text-slate-400 pt-2">
                        Video generation typically completes within 30–60 seconds.
                      </div>
                    </div>
                  </div>
                ) : videoUrl ? (
                  <div className="w-full flex flex-col items-center space-y-3">
                    <div
                      className={`rounded-xl overflow-hidden bg-black border border-slate-800 shadow-md ${
                        aspectRatio === '9:16' ? 'max-w-xs' : 'w-full'
                      }`}
                    >
                      <video
                        ref={videoPlayerRef}
                        src={videoUrl}
                        controls
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-auto object-contain rounded-xl"
                      />
                    </div>
                    <div className="text-xs text-slate-600 font-mono">
                      Aspect Ratio: {aspectRatio} • Model: veo-3.1-fast-generate-preview
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-80 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Film className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-slate-700">
                      No Video Generated in this Session
                    </div>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Upload a site photo or select a project preset, then click "Generate Veo 3D Inspection Video".
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Engine: veo-3.1-fast-generate-preview</span>
              <span>MoSPI Geofenced Video Audit Verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
