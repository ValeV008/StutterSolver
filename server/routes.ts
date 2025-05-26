import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRecordingSchema, insertPhraseSchema, insertTtsGenerationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Recordings endpoints
  app.get("/api/recordings", async (req, res) => {
    try {
      const recordings = await storage.getAllRecordings();
      res.json(recordings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recordings" });
    }
  });

  app.get("/api/recordings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recording = await storage.getRecording(id);
      if (!recording) {
        return res.status(404).json({ message: "Recording not found" });
      }
      res.json(recording);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recording" });
    }
  });

  app.post("/api/recordings", async (req, res) => {
    try {
      const validatedData = insertRecordingSchema.parse(req.body);
      const recording = await storage.createRecording(validatedData);
      res.status(201).json(recording);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recording data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recording" });
    }
  });

  app.delete("/api/recordings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRecording(id);
      if (!deleted) {
        return res.status(404).json({ message: "Recording not found" });
      }
      res.json({ message: "Recording deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recording" });
    }
  });

  // Phrases endpoints
  app.get("/api/phrases", async (req, res) => {
    try {
      const phrases = await storage.getAllPhrases();
      res.json(phrases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch phrases" });
    }
  });

  app.get("/api/phrases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const phrase = await storage.getPhrase(id);
      if (!phrase) {
        return res.status(404).json({ message: "Phrase not found" });
      }
      res.json(phrase);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch phrase" });
    }
  });

  app.post("/api/phrases", async (req, res) => {
    try {
      const validatedData = insertPhraseSchema.parse(req.body);
      const phrase = await storage.createPhrase(validatedData);
      res.status(201).json(phrase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid phrase data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create phrase" });
    }
  });

  app.delete("/api/phrases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePhrase(id);
      if (!deleted) {
        return res.status(404).json({ message: "Phrase not found" });
      }
      res.json({ message: "Phrase deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete phrase" });
    }
  });

  // TTS Generation endpoints
  app.get("/api/tts-generations", async (req, res) => {
    try {
      const generations = await storage.getAllTtsGenerations();
      res.json(generations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch TTS generations" });
    }
  });

  app.post("/api/tts-generations", async (req, res) => {
    try {
      console.log("TTS request body:", req.body);
      const validatedData = insertTtsGenerationSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      
      // Generate speech using ElevenLabs
      const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
        },
        body: JSON.stringify({
          text: validatedData.inputText,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      const audioData = `data:audio/mpeg;base64,${audioBase64}`;
      
      const ttsGeneration = await storage.createTtsGeneration({
        inputText: validatedData.inputText,
        speed: validatedData.speed || "1.0",
        pitch: validatedData.pitch || "1.0",
        audioData,
        duration: Math.floor(validatedData.inputText.length / 15) // Rough estimate based on speech rate
      });
      
      res.status(201).json(ttsGeneration);
    } catch (error) {
      console.error("TTS Generation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid TTS generation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to generate speech" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const recordings = await storage.getAllRecordings();
      const phrases = await storage.getAllPhrases();
      
      const totalRecorded = recordings.length;
      const totalPhrases = phrases.length;
      const totalDuration = recordings.reduce((sum, r) => sum + r.duration, 0);
      const averageQuality = recordings.length > 0 
        ? recordings.filter(r => r.quality === "good").length / recordings.length > 0.7 ? "Good" : "Fair"
        : "No Data";

      res.json({
        recorded: totalRecorded,
        total: totalPhrases,
        duration: totalDuration,
        quality: averageQuality,
        percentage: Math.round((totalRecorded / Math.max(totalPhrases, 100)) * 100)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
