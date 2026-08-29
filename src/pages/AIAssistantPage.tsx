import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  MapPin,
  Globe,
  Image as ImageIcon,
  Film,
  Radio,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { GeminiChatTab } from '../components/ai/GeminiChatTab';
import { MapsGroundingTab } from '../components/ai/MapsGroundingTab';
import { SearchGroundingTab } from '../components/ai/SearchGroundingTab';
import { ImageStudioTab } from '../components/ai/ImageStudioTab';
import { VeoVideoTab } from '../components/ai/VeoVideoTab';
import { LiveVoiceTab } from '../components/ai/LiveVoiceTab';

type AITabType = 'chat' | 'maps' | 'search' | 'image' | 'video' | 'voice';

export const AIAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AITabType>('chat');

  const tabs: Array<{ id: AITabType; label: string; icon: React.ComponentType<{ className?: string }>; tag: string }> = [
    {
      id: 'chat',
      label: 'Multi-Turn Chat',
      icon: MessageSquare,
      tag: 'gemini-3.5-flash / 3.1-pro / 3.1-lite',
    },
    {
      id: 'maps',
      label: 'Google Maps Grounding',
      icon: MapPin,
      tag: 'gemini-3.5-flash + googleMaps',
    },
    {
      id: 'search',
      label: 'Google Search Grounding',
      icon: Globe,
      tag: 'gemini-3.5-flash + googleSearch',
    },
    {
      id: 'image',
      label: 'Create & Edit Images',
      icon: ImageIcon,
      tag: 'gemini-3.1-flash-image-preview',
    },
    {
      id: 'video',
      label: 'Animate Photos to Video',
      icon: Film,
      tag: 'veo-3.1-fast-generate-preview',
    },
    {
      id: 'voice',
      label: 'Live Voice Room',
      icon: Radio,
      tag: 'gemini-3.1-flash-live-preview',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
            <Sparkles className="w-3 h-3 text-blue-600" />
            Google GenAI Intelligence Center • MoSPI Nodal Audit
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Sentinel AI Forensic & Multimodal Suite
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
            Unified multimodal AI suite for institutional scheme auditing, live search & maps grounding,
            high-resolution CAD synthesis, Veo 3D drone inspection videos, and real-time voice consultations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Server-Side Gemini SDK (Proxy Secured)</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Viewport */}
      <div>
        {activeTab === 'chat' && <GeminiChatTab />}
        {activeTab === 'maps' && <MapsGroundingTab />}
        {activeTab === 'search' && <SearchGroundingTab />}
        {activeTab === 'image' && <ImageStudioTab />}
        {activeTab === 'video' && <VeoVideoTab />}
        {activeTab === 'voice' && <LiveVoiceTab />}
      </div>
    </div>
  );
};
