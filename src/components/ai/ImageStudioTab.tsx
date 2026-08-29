import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Wand2,
  Upload,
  Download,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Layers,
  Eye,
  FileImage,
} from 'lucide-react';
import { aiService, ImageGenResult } from '../../services/aiService';

const SAMPLE_PROJECT_IMAGES = [
  {
    name: 'Hospital Building Site',
    url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80',
    description: 'Primary Healthcare Facility in Baramati',
  },
  {
    name: 'Road Construction Site',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?auto=format&fit=crop&w=600&q=80',
    description: 'Rural All-Weather Connecting Road',
  },
  {
    name: 'Community Center Slab',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
    description: 'Gram Panchayat Multipurpose Hall',
  },
];

const PRESET_IMAGE_PROMPTS = [
  'Architectural 3D render of a modern solar-powered primary health center in rural India with rainwater harvesting',
  'Civil engineering blueprint of an all-weather 2-lane bridge over a river with concrete embankments',
  'Community smart classroom equipped with digital projector, solar backup batteries, and ergonomic desks',
  'Drinking water RO filtration plant with solar canopy and overhead stainless steel storage tanks',
];

const PRESET_EDIT_PROMPTS = [
  'Add a 15kW rooftop solar panel array with aluminum mounting racks on the roof of this building',
  'Simulate fully completed smooth asphalt paving with painted white lane markings on this unpaved dirt road',
  'Add lush landscaped green trees, boundary security fence, and paved pedestrian walkway around the structure',
  'Highlight the structural concrete crack and foundation settlement in bright red forensic marker',
];

export const ImageStudioTab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1' | '9:16' | '3:4'>('16:9');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState<string>('');

  // Edit Mode Specific State
  const [sourceImageBase64, setSourceImageBase64] = useState<string | null>(null);
  const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Str = reader.result as string;
      setSourceImageBase64(base64Str);
      setSourceImagePreview(base64Str);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSampleImage = async (url: string) => {
    try {
      setSourceImagePreview(url);
      // Fetch and convert sample url to base64
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImageBase64(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to convert sample image:', err);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      if (activeMode === 'create') {
        const res = await aiService.generateImage(prompt, aspectRatio);
        setGeneratedImage(res.imageUrl);
        setImageCaption(res.caption || prompt);
      } else {
        if (!sourceImageBase64) {
          throw new Error('Please upload or select a source site photo to edit.');
        }
        const res = await aiService.editImage(sourceImageBase64, prompt, aspectRatio);
        setGeneratedImage(res.editedImageUrl);
        setImageCaption(res.caption || prompt);
      }
    } catch (err: any) {
      console.error('Image Studio Error:', err);
      setError(err?.message || 'Failed to process image with Gemini Image model.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <Sparkles className="w-3 h-3" />
              Gemini 3.1 Flash Image Preview (Nano Banana)
            </div>
            <h2 className="text-lg font-bold font-display text-slate-900 mt-1">
              Project Site CAD & Milestone Visual Studio
            </h2>
            <p className="text-xs text-slate-600">
              Generate photorealistic civil engineering blueprints, milestone completion simulations,
              or edit real contractor site photos to verify structural upgrades.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveMode('create');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeMode === 'create'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Create New Image</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('edit');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeMode === 'edit'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Edit Site Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            {/* Edit Mode: Source Image Picker */}
            {activeMode === 'edit' && (
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  1. SELECT SOURCE SITE PHOTO
                </label>

                {/* Upload or Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-lg p-4 text-center cursor-pointer bg-slate-50/70 hover:bg-purple-50/30 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <div className="text-xs font-semibold text-slate-700">
                    {sourceImagePreview ? 'Change Photo (Upload New)' : 'Click to Upload Site Photo'}
                  </div>
                  <div className="text-[10px] text-slate-400">PNG, JPG, WebP up to 15MB</div>
                </div>

                {/* Sample Presets */}
                <div>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold block mb-1.5">
                    OR CHOOSE AUDITED SAMPLE PHOTO:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_PROJECT_IMAGES.map((sample, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSampleImage(sample.url)}
                        className={`rounded-lg overflow-hidden border cursor-pointer group relative aspect-video ${
                          sourceImagePreview === sample.url
                            ? 'border-purple-600 ring-2 ring-purple-400'
                            : 'border-slate-200 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={sample.url}
                          alt={sample.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent p-1 flex items-end">
                          <span className="text-[9px] font-medium text-white truncate leading-none">
                            {sample.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
                <span>{activeMode === 'create' ? 'PROMPT INSTRUCTIONS' : '2. EDIT INSTRUCTIONS'}</span>
                <span className="text-purple-600 font-normal">Gemini 3.1 Flash Image</span>
              </label>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder={
                  activeMode === 'create'
                    ? 'e.g. Architectural blueprint of a 30-bed hospital with solar panels and ambulance ramp...'
                    : 'e.g. Add 15kW rooftop solar panels and clean concrete landscaping to this site...'
                }
                className="w-full bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-lg p-3 text-xs sm:text-sm text-slate-900 focus:outline-none transition-colors"
              />

              {/* Quick Prompt Ideas */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-semibold block mb-1">
                  SUGGESTED PROMPTS:
                </span>
                <div className="flex flex-col gap-1.5">
                  {(activeMode === 'create' ? PRESET_IMAGE_PROMPTS : PRESET_EDIT_PROMPTS).map(
                    (p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(p)}
                        className="text-left text-[11px] text-slate-600 hover:text-purple-700 bg-slate-50 hover:bg-purple-50/60 p-2 rounded border border-slate-200 transition-colors line-clamp-1"
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                ASPECT RATIO
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['16:9', '4:3', '1:1', '3:4', '9:16'] as const).map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setAspectRatio(ar)}
                    className={`py-1.5 text-xs font-mono font-semibold rounded border text-center transition-all ${
                      aspectRatio === ar
                        ? 'bg-purple-600 text-white border-purple-700 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || (activeMode === 'edit' && !sourceImageBase64)}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Image with Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>{activeMode === 'create' ? 'Generate Visual Render' : 'Apply AI Photo Edit'}</span>
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

        {/* Right Canvas / Preview Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs min-h-[460px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-display text-slate-900">
                    {activeMode === 'edit' && sourceImagePreview ? 'Visual Comparison Canvas' : 'Generated Visual Artifact'}
                  </span>
                  {generatedImage && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Render Complete
                    </span>
                  )}
                </div>

                {generatedImage && (
                  <a
                    href={generatedImage}
                    download={`mplads-gemini-${Date.now()}.png`}
                    className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded border border-purple-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG
                  </a>
                )}
              </div>

              {/* Main View Area */}
              <div className="mt-4">
                {loading ? (
                  <div className="h-72 rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                    <div className="text-sm font-semibold text-slate-800">
                      Generating with gemini-3.1-flash-image-preview...
                    </div>
                    <div className="text-xs text-slate-500 max-w-sm">
                      Executing diffusion synthesis and geometry rendering for infrastructure simulation.
                    </div>
                  </div>
                ) : activeMode === 'edit' && sourceImagePreview && generatedImage ? (
                  /* Comparison Grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase">
                        ORIGINAL SITE PHOTO:
                      </span>
                      <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-video">
                        <img
                          src={sourceImagePreview}
                          alt="Original Site"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono font-semibold text-purple-700 uppercase flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI EDITED PREVIEW:
                      </span>
                      <div className="rounded-lg overflow-hidden border border-purple-300 ring-2 ring-purple-100 bg-slate-900 aspect-video">
                        <img
                          src={generatedImage}
                          alt="AI Edited Site"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ) : generatedImage ? (
                  /* Single Image View */
                  <div className="space-y-2">
                    <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-950 flex items-center justify-center max-h-[440px]">
                      <img
                        src={generatedImage}
                        alt="Generated Render"
                        className="max-h-[440px] w-auto object-contain"
                      />
                    </div>
                    {imageCaption && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded border border-slate-100">
                        "{imageCaption}"
                      </p>
                    )}
                  </div>
                ) : (
                  /* Placeholder Empty State */
                  <div className="h-72 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                      <FileImage className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-slate-700">No Image Generated Yet</div>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Type a civil infrastructure prompt on the left to render a 3D architectural mock-up or edit an existing site photograph.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Institutional Disclaimer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Model: gemini-3.1-flash-image-preview</span>
              <span>MoSPI Technical Evaluation Asset</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
