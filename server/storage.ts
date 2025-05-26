import { recordings, phrases, ttsGenerations, type Recording, type Phrase, type TtsGeneration, type InsertRecording, type InsertPhrase, type InsertTtsGeneration } from "@shared/schema";

export interface IStorage {
  // Recordings
  createRecording(recording: InsertRecording): Promise<Recording>;
  getRecording(id: number): Promise<Recording | undefined>;
  getAllRecordings(): Promise<Recording[]>;
  getRecordingsByPhraseId(phraseId: number): Promise<Recording[]>;
  deleteRecording(id: number): Promise<boolean>;
  
  // Phrases
  createPhrase(phrase: InsertPhrase): Promise<Phrase>;
  getPhrase(id: number): Promise<Phrase | undefined>;
  getAllPhrases(): Promise<Phrase[]>;
  updatePhrase(id: number, updates: Partial<Phrase>): Promise<Phrase | undefined>;
  deletePhrase(id: number): Promise<boolean>;
  
  // TTS Generations
  createTtsGeneration(data: { inputText: string; speed: string; pitch: string; audioData: string; duration: number }): Promise<TtsGeneration>;
  getTtsGeneration(id: number): Promise<TtsGeneration | undefined>;
  getAllTtsGenerations(): Promise<TtsGeneration[]>;
  deleteTtsGeneration(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private recordings: Map<number, Recording>;
  private phrases: Map<number, Phrase>;
  private ttsGenerations: Map<number, TtsGeneration>;
  private currentRecordingId: number;
  private currentPhraseId: number;
  private currentTtsId: number;

  constructor() {
    this.recordings = new Map();
    this.phrases = new Map();
    this.ttsGenerations = new Map();
    this.currentRecordingId = 1;
    this.currentPhraseId = 1;
    this.currentTtsId = 1;
    
    // Initialize with default phrases
    this.initializeDefaultPhrases();
  }

  private async initializeDefaultPhrases() {
    const defaultPhrases = [
      "The quick brown fox jumps over the lazy dog near the riverbank.",
      "The weather today is absolutely beautiful and perfect for a walk.",
      "Technology continues to advance at an unprecedented rate.",
      "Artificial intelligence is transforming how we communicate.",
      "I enjoy reading books and learning about different cultures.",
      "Communication is the foundation of all human relationships.",
      "Success comes from dedication, hard work, and perseverance.",
      "The ocean waves crash against the rocky shoreline.",
      "Music has the power to bring people together across cultures.",
      "Every challenge presents an opportunity for growth and learning."
    ];

    for (const text of defaultPhrases) {
      await this.createPhrase({
        text,
        category: "training",
        difficulty: "medium"
      });
    }
  }

  // Recording methods
  async createRecording(insertRecording: InsertRecording): Promise<Recording> {
    const id = this.currentRecordingId++;
    const recording: Recording = {
      ...insertRecording,
      id,
      createdAt: new Date(),
    };
    this.recordings.set(id, recording);

    // Update phrase as recorded
    const phrase = this.phrases.get(insertRecording.phraseId);
    if (phrase) {
      const updatedPhrase = { ...phrase, isRecorded: true, recordingId: id };
      this.phrases.set(phrase.id, updatedPhrase);
    }

    return recording;
  }

  async getRecording(id: number): Promise<Recording | undefined> {
    return this.recordings.get(id);
  }

  async getAllRecordings(): Promise<Recording[]> {
    return Array.from(this.recordings.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecordingsByPhraseId(phraseId: number): Promise<Recording[]> {
    return Array.from(this.recordings.values()).filter(r => r.phraseId === phraseId);
  }

  async deleteRecording(id: number): Promise<boolean> {
    const recording = this.recordings.get(id);
    if (!recording) return false;

    this.recordings.delete(id);

    // Update phrase as not recorded
    const phrase = this.phrases.get(recording.phraseId);
    if (phrase) {
      const updatedPhrase = { ...phrase, isRecorded: false, recordingId: undefined };
      this.phrases.set(phrase.id, updatedPhrase);
    }

    return true;
  }

  // Phrase methods
  async createPhrase(insertPhrase: InsertPhrase): Promise<Phrase> {
    const id = this.currentPhraseId++;
    const phrase: Phrase = {
      ...insertPhrase,
      id,
      isRecorded: false,
      recordingId: undefined,
      createdAt: new Date(),
    };
    this.phrases.set(id, phrase);
    return phrase;
  }

  async getPhrase(id: number): Promise<Phrase | undefined> {
    return this.phrases.get(id);
  }

  async getAllPhrases(): Promise<Phrase[]> {
    return Array.from(this.phrases.values()).sort((a, b) => a.id - b.id);
  }

  async updatePhrase(id: number, updates: Partial<Phrase>): Promise<Phrase | undefined> {
    const phrase = this.phrases.get(id);
    if (!phrase) return undefined;

    const updatedPhrase = { ...phrase, ...updates };
    this.phrases.set(id, updatedPhrase);
    return updatedPhrase;
  }

  async deletePhrase(id: number): Promise<boolean> {
    return this.phrases.delete(id);
  }

  // TTS Generation methods
  async createTtsGeneration(data: { inputText: string; speed: string; pitch: string; audioData: string; duration: number }): Promise<TtsGeneration> {
    const id = this.currentTtsId++;
    const ttsGeneration: TtsGeneration = {
      id,
      inputText: data.inputText,
      speed: data.speed,
      pitch: data.pitch,
      audioData: data.audioData,
      duration: data.duration,
      createdAt: new Date(),
    };
    this.ttsGenerations.set(id, ttsGeneration);
    return ttsGeneration;
  }

  async getTtsGeneration(id: number): Promise<TtsGeneration | undefined> {
    return this.ttsGenerations.get(id);
  }

  async getAllTtsGenerations(): Promise<TtsGeneration[]> {
    return Array.from(this.ttsGenerations.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteTtsGeneration(id: number): Promise<boolean> {
    return this.ttsGenerations.delete(id);
  }
}

export const storage = new MemStorage();
