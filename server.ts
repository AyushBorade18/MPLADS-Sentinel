import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, GenerateVideosOperation, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, initDb } from './db.js';

dotenv.config();

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sentinel_super_secret_key_2026';

// Lazy GenAI initialization
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

async function startServer() {
  initDb();
  
  const app = express();
  const server = http.createServer(app);

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- Auth Routes ---
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = bcrypt.compareSync(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err: any) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/signup', (req, res) => {
    try {
      const { email, password } = req.body;
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      const result = db.prepare('INSERT INTO users (email, passwordHash) VALUES (?, ?)').run(email, hash);
      
      const token = jwt.sign({ id: result.lastInsertRowid, email, role: 'viewer' }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: result.lastInsertRowid, email, role: 'viewer' } });
    } catch (err: any) {
      res.status(500).json({ error: 'Signup failed' });
    }
  });

  // --- Database Routes ---
  app.get('/api/projects', authenticateToken, (req, res) => {
    try {
      const projects = db.prepare('SELECT * FROM projects').all();
      res.json(projects);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/projects/:id', authenticateToken, (req, res) => {
    try {
      const { id } = req.params;
      const project = db.prepare('SELECT * FROM projects WHERE projectId = ?').get(id) as any;
      if (!project) return res.status(404).json({ error: 'Project not found' });

      project.milestones = db.prepare('SELECT * FROM project_milestones WHERE projectId = ?').all(id);
      project.riskFactors = db.prepare('SELECT * FROM project_risk_factors WHERE projectId = ?').all(id);
      project.evidence = db.prepare('SELECT * FROM project_evidence WHERE projectId = ?').all(id).map((e: any) => ({
        ...e,
        missing: Boolean(e.missing)
      }));
      project.auditLogs = db.prepare('SELECT * FROM project_audit_logs WHERE projectId = ?').all(id);
      
      res.json(project);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. Multi-turn Gemini Chatbot
  // Models: gemini-3.1-pro-preview (complex), gemini-3.5-flash (general), gemini-3.1-flash-lite (fast)
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        model = 'gemini-3.5-flash',
        systemInstruction,
        temperature = 0.7,
      } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'A valid message string is required.' });
      }

      const ai = getGenAI();

      // Formulate system instruction for Sentinel MPLADS Forensic Auditor
      const defaultSystemInstruction =
        'You are the Sentinel MoSPI AI Lead Forensic Auditor and Scheme Investigator for MPLADS (Member of Parliament Local Area Development Scheme). ' +
        'You analyze fund allocations, expenditure velocity, contractor bidding clusters, delay anomalies, GIS coordinates, and statutory guidelines. ' +
        'Provide structured, authoritative, data-driven, and clear audit assessments with actionable recommendations.';

      // Format history for @google/genai chats.create
      // history items: { role: 'user' | 'model', parts: [{ text: string }] }
      const formattedHistory = Array.isArray(history)
        ? history.map((item: any) => ({
            role: item.role === 'assistant' ? 'model' : item.role,
            parts: Array.isArray(item.parts)
              ? item.parts
              : [{ text: item.content || item.text || '' }],
          }))
        : [];

      const chat = ai.chats.create({
        model: model || 'gemini-3.5-flash',
        config: {
          systemInstruction: systemInstruction || defaultSystemInstruction,
          temperature: temperature,
        },
        history: formattedHistory,
      });

      const response = await chat.sendMessage({
        message,
      });

      res.json({
        text: response.text || '',
        modelUsed: model || 'gemini-3.5-flash',
        usageMetadata: response.usageMetadata || null,
      });
    } catch (err: any) {
      console.error('Chat API Error:', err);
      res.status(500).json({
        error: err.message || 'Failed to process chat query with Gemini API.',
      });
    }
  });

  // 2. Google Search Grounding (gemini-3.5-flash with googleSearch tool)
  app.post('/api/gemini/search-grounding', async (req, res) => {
    try {
      const { query, systemInstruction } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'A query string is required.' });
      }

      const ai = getGenAI();

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: query,
        config: {
          systemInstruction:
            systemInstruction ||
            'You are an institutional research assistant for MPLADS and government infrastructure schemes. Provide up-to-date facts backed by web search.',
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || '';
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const webChunks =
        groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title || 'Web Reference',
          uri: chunk.web?.uri || '#',
        })) || [];
      const searchQueries = groundingMetadata?.webSearchQueries || [];

      res.json({
        text,
        sources: webChunks,
        searchQueries,
        modelUsed: 'gemini-3.5-flash',
      });
    } catch (err: any) {
      console.error('Search Grounding Error:', err);
      res.status(500).json({
        error: err.message || 'Failed to perform search grounding query.',
      });
    }
  });

  // 3. Google Maps Grounding (gemini-3.5-flash with googleMaps tool)
  app.post('/api/gemini/maps-grounding', async (req, res) => {
    try {
      const { query, latitude, longitude } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'A location query is required.' });
      }

      const ai = getGenAI();

      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (latitude !== undefined && longitude !== undefined) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: Number(latitude),
              longitude: Number(longitude),
            },
          },
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: query,
        config,
      });

      const text = response.text || '';
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

      // Extract places and URLs from groundingChunks
      const rawChunks = groundingMetadata?.groundingChunks || [];
      const places: Array<{ title: string; uri: string }> = [];

      for (const chunk of rawChunks) {
        if (chunk.maps) {
          places.push({
            title: chunk.maps.title || 'Google Maps Location',
            uri: chunk.maps.uri || '',
          });
        }
      }

      res.json({
        text,
        places,
        groundingMetadata,
        modelUsed: 'gemini-3.5-flash',
      });
    } catch (err: any) {
      console.error('Maps Grounding Error:', err);
      res.status(500).json({
        error: err.message || 'Failed to perform maps grounding query.',
      });
    }
  });

  // 4. Create Images (gemini-3.1-flash-image-preview)
  app.post('/api/gemini/generate-image', async (req, res) => {
    try {
      const { prompt, aspectRatio = '16:9', imageSize = '1K' } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'A prompt is required for image generation.' });
      }

      const ai = getGenAI();

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: imageSize as any,
          },
        },
      });

      let imageUrl: string | null = null;
      let caption: string = '';

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          caption += part.text;
        }
      }

      if (!imageUrl) {
        return res.status(500).json({
          error: 'No image was returned by the image generation model.',
          caption,
        });
      }

      res.json({
        imageUrl,
        caption: caption.trim(),
        modelUsed: 'gemini-3.1-flash-image-preview',
      });
    } catch (err: any) {
      console.error('Image Generation Error:', err);
      res.status(500).json({
        error: err.message || 'Failed to generate image with Gemini.',
      });
    }
  });

  // 5. Edit Images (gemini-3.1-flash-image-preview)
  app.post('/api/gemini/edit-image', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/png', prompt, aspectRatio = '16:9' } = req.body;

      if (!imageBase64 || !prompt) {
        return res.status(400).json({ error: 'Both imageBase64 and prompt are required.' });
      }

      // Strip data URI prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      const ai = getGenAI();

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/png',
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

      let editedImageUrl: string | null = null;
      let caption = '';

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          editedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          caption += part.text;
        }
      }

      if (!editedImageUrl) {
        return res.status(500).json({
          error: 'No edited image returned from the model.',
          caption,
        });
      }

      res.json({
        editedImageUrl,
        caption: caption.trim(),
        modelUsed: 'gemini-3.1-flash-image-preview',
      });
    } catch (err: any) {
      console.error('Image Edit Error:', err);
      res.status(500).json({
        error: err.message || 'Failed to edit image with Gemini.',
      });
    }
  });

  // 6. Animate Images into Video (veo-3.1-fast-generate-preview)
  // Step 1: Start Video Generation
  app.post('/api/gemini/generate-video', async (req, res) => {
    try {
      const {
        prompt = 'Cinematic aerial drone flyover inspection of the construction site',
        imageBase64,
        mimeType = 'image/png',
        aspectRatio = '16:9', // '16:9' or '9:16'
        resolution = '720p', // '720p' or '1080p'
      } = req.body;

      const ai = getGenAI();

      const payload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Drone flyover inspection',
        config: {
          numberOfVideos: 1,
          resolution: resolution as any,
          aspectRatio: aspectRatio as any,
        },
      };

      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        payload.image = {
          imageBytes: cleanBase64,
          mimeType: mimeType || 'image/png',
        };
      }

      const operation = await ai.models.generateVideos(payload);

      res.json({
        operationName: operation.name,
        aspectRatio,
        modelUsed: 'veo-3.1-fast-generate-preview',
      });
    } catch (err: any) {
      console.error('Generate Video Error:', err);
      res.status(500).json({
        error: err.message || 'Failed to initiate Veo video generation.',
      });
    }
  });

  // Step 2: Poll Video Status
  app.post('/api/gemini/video-status', async (req, res) => {
    try {
      const { operationName } = req.body;

      if (!operationName) {
        return res.status(400).json({ error: 'operationName is required.' });
      }

      const ai = getGenAI();
      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });

      res.json({
        done: Boolean(updated.done),
        error: updated.error || null,
      });
    } catch (err: any) {
      console.error('Video Status Poll Error:', err);
      res.status(500).json({
        error: err.message || 'Failed to poll video generation status.',
      });
    }
  });

  // Step 3: Download Generated Video Stream
  app.post('/api/gemini/video-download', async (req, res) => {
    try {
      const { operationName } = req.body;

      if (!operationName) {
        return res.status(400).json({ error: 'operationName is required.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY missing.' });
      }

      const ai = getGenAI();
      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

      if (!uri) {
        return res.status(404).json({ error: 'Video URI not found in completed operation.' });
      }

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': apiKey },
      });

      if (!videoRes.ok) {
        return res.status(videoRes.status).json({
          error: `Failed to fetch video stream from Google storage: ${videoRes.statusText}`,
        });
      }

      res.setHeader('Content-Type', 'video/mp4');
      const buffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err: any) {
      console.error('Video Download Error:', err);
      res.status(500).json({
        error: err.message || 'Failed to download generated video.',
      });
    }
  });

  // 7. TTS Audio Briefing (gemini-3.1-flash-tts-preview)
  app.post('/api/gemini/speech-briefing', async (req, res) => {
    try {
      const { text, voice = 'Kore' } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Text content is required for speech synthesis.' });
      }

      const ai = getGenAI();

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: text.slice(0, 1000) }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        return res.status(500).json({ error: 'No audio generated by TTS.' });
      }

      res.json({
        base64Audio,
        sampleRate: 24000,
        modelUsed: 'gemini-3.1-flash-tts-preview',
      });
    } catch (err: any) {
      console.error('TTS API Error:', err);
      res.status(500).json({
        error: err.message || 'Failed to generate speech briefing.',
      });
    }
  });

  // 8. WebSocket for Live Voice API (gemini-3.1-flash-live-preview)
  const wss = new WebSocketServer({ server, path: '/ws/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('Client connected to Live Voice WebSocket');
    let session: any = null;

    try {
      const ai = getGenAI();

      session = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction:
            'You are the voice interface for Sentinel MPLADS Forensic Auditor. Speak concisely, clearly, and authoritatively about project schemes, audit flags, budget utilization, and field verification.',
        },
        callbacks: {
          onmessage: (message: any) => {
            const audio =
              message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            console.log('Gemini Live session closed');
          },
          onerror: (err: any) => {
            console.error('Gemini Live error:', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ error: err?.message || 'Live session error' }));
            }
          },
        },
      });

      clientWs.on('message', (data: Buffer | string) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio && session) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          }
        } catch (e) {
          console.error('Error parsing client live message:', e);
        }
      });

      clientWs.on('close', () => {
        console.log('Client disconnected from Live WebSocket');
        if (session && typeof session.close === 'function') {
          session.close();
        }
      });
    } catch (err: any) {
      console.error('Live API Session Connect Error:', err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: err.message || 'Could not connect to Gemini Live.' }));
      }
    }
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Sentinel Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
});
