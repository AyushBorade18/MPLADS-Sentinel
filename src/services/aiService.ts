import { mockAIResponses, AIQueryResponse } from '../data/mockAIKnowledge';
import { projectService } from './projectService';

export interface ChatHistoryItem {
  role: 'user' | 'model' | 'assistant';
  parts: Array<{ text: string }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  modelUsed?: string;
  groundingSources?: Array<{ title: string; uri: string }>;
  groundingPlaces?: Array<{ title: string; uri: string }>;
  responsePayload?: AIQueryResponse;
  audioBase64?: string;
}

export type GeminiModelType = 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';

export interface GroundedSearchResult {
  text: string;
  sources: Array<{ title: string; uri: string }>;
  searchQueries: string[];
  modelUsed: string;
}

export interface GroundedMapsResult {
  text: string;
  places: Array<{ title: string; uri: string }>;
  modelUsed: string;
}

export interface ImageGenResult {
  imageUrl: string;
  caption: string;
  modelUsed: string;
}

export interface VideoGenStartResult {
  operationName: string;
  aspectRatio: '16:9' | '9:16';
  modelUsed: string;
}

export const aiService = {
  // 1. Multi-turn Gemini Chatbot with conversation history & model selection
  sendChatMessage: async (
    message: string,
    history: ChatHistoryItem[] = [],
    model: GeminiModelType = 'gemini-3.5-flash',
    systemInstruction?: string
  ): Promise<{ text: string; modelUsed: string; sources?: Array<{ title: string; uri: string }> }> => {
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history,
          model,
          systemInstruction,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      return {
        text: data.text,
        modelUsed: data.modelUsed || model,
      };
    } catch (err: any) {
      console.warn('Gemini live chat failed, using local forensic engine fallback:', err);
      // Fallback query response
      const fallback = await aiService.queryAssistant(message);
      return {
        text: `${fallback.summary}\n\n**Key Findings:**\n${fallback.keyInsights.map((k) => `• ${k}`).join('\n')}\n\n**Action:** ${fallback.suggestedAction}`,
        modelUsed: 'local-audit-engine (offline fallback)',
      };
    }
  },

  // 2. Google Search Grounding with gemini-3.5-flash
  searchGrounding: async (query: string): Promise<GroundedSearchResult> => {
    const res = await fetch('/api/gemini/search-grounding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Search grounding failed with status ${res.status}`);
    }

    return await res.json();
  },

  // 3. Google Maps Grounding with gemini-3.5-flash
  mapsGrounding: async (
    query: string,
    coords?: { latitude: number; longitude: number }
  ): Promise<GroundedMapsResult> => {
    const res = await fetch('/api/gemini/maps-grounding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Maps grounding failed with status ${res.status}`);
    }

    return await res.json();
  },

  // 4. Create Image with gemini-3.1-flash-image-preview
  generateImage: async (
    prompt: string,
    aspectRatio: '1:1' | '16:9' | '4:3' | '3:4' | '9:16' = '16:9'
  ): Promise<ImageGenResult> => {
    const res = await fetch('/api/gemini/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Image generation failed with status ${res.status}`);
    }

    return await res.json();
  },

  // 5. Edit Image with gemini-3.1-flash-image-preview
  editImage: async (
    imageBase64: string,
    prompt: string,
    aspectRatio: '1:1' | '16:9' | '4:3' | '3:4' | '9:16' = '16:9'
  ): Promise<{ editedImageUrl: string; caption: string; modelUsed: string }> => {
    const res = await fetch('/api/gemini/edit-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, prompt, aspectRatio }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Image editing failed with status ${res.status}`);
    }

    return await res.json();
  },

  // 6. Veo Video Generation with veo-3.1-fast-generate-preview
  startVideoGeneration: async (
    prompt: string,
    imageBase64?: string,
    aspectRatio: '16:9' | '9:16' = '16:9',
    resolution: '720p' | '1080p' = '720p'
  ): Promise<VideoGenStartResult> => {
    const res = await fetch('/api/gemini/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, imageBase64, aspectRatio, resolution }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Video generation start failed with status ${res.status}`);
    }

    return await res.json();
  },

  pollVideoStatus: async (operationName: string): Promise<{ done: boolean; error?: any }> => {
    const res = await fetch('/api/gemini/video-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationName }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to poll video status`);
    }

    return await res.json();
  },

  downloadVideoBlob: async (operationName: string): Promise<Blob> => {
    const res = await fetch('/api/gemini/video-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationName }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Video download failed`);
    }

    return await res.blob();
  },

  // 7. TTS Speech Briefing with gemini-3.1-flash-tts-preview
  generateSpeech: async (text: string, voice = 'Kore'): Promise<{ base64Audio: string; sampleRate: number }> => {
    const res = await fetch('/api/gemini/speech-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `TTS failed with status ${res.status}`);
    }

    return await res.json();
  },

  // Legacy structured query helper
  queryAssistant: async (promptText: string): Promise<AIQueryResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const p = promptText.toLowerCase();

    if (p.includes('bihar') || p.includes('delay')) {
      return mockAIResponses['delayed_projects_bihar'];
    }
    if (p.includes('kerala') || p.includes('vendor')) {
      return mockAIResponses['vendor_concentration_kerala'];
    }
    if (p.includes('expenditure') || p.includes('trend') || p.includes('financial') || p.includes('sector')) {
      return mockAIResponses['financial_trends_breakdown'];
    }
    if (p.includes('maharashtra') || p.includes('high risk') || p.includes('baramati')) {
      return mockAIResponses['high_risk_maharashtra'];
    }
    if (p.includes('4921') || p.includes('flagged') || p.includes('ward 12')) {
      return mockAIResponses['why_flagged_4921'];
    }

    const allProjects = await projectService.getAllProjects();
    const delayedCount = allProjects.filter((x) => x.status === 'Delayed').length;
    const highRiskCount = allProjects.filter((x) => x.riskLevel === 'High').length;

    return {
      query: promptText,
      summary: `Analyzed institutional query: "${promptText}". Currently tracking ${allProjects.length} active MPLADS projects nationwide with ${highRiskCount} classified under High Risk Oversight.`,
      keyInsights: [
        `System detected ${delayedCount} projects experiencing milestone schedule deviation.`,
        'Financial disbursement utilization across audited blocks is averaging 78.8%.',
        'Geofencing validation protocol is active for all newly uploaded infrastructure milestones.',
      ],
      suggestedAction: 'Filter by specific State/District or click into Project Directory for itemized ledgers.',
      sourceDocuments: [
        'MPLADS Sentinel Core Ledger 2023-24',
        'National Anomaly Detection Ruleset v2.4',
        'Auditor Verification Stream #NAT-01',
      ],
      contextType: 'general',
      relatedProjectIds: ['PRJ-2023-4921', 'PRJ-24-1042', 'PRJ-24-0891'],
    };
  },
};
