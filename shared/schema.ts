import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const recordings = pgTable("recordings", {
  id: serial("id").primaryKey(),
  phraseId: integer("phrase_id").notNull(),
  audioData: text("audio_data").notNull(), // base64 encoded audio
  duration: integer("duration").notNull(), // in seconds
  quality: text("quality").notNull().default("good"), // good, fair, poor
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const phrases = pgTable("phrases", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  category: text("category").notNull().default("training"),
  isRecorded: boolean("is_recorded").default(false).notNull(),
  recordingId: integer("recording_id"),
  difficulty: text("difficulty").notNull().default("medium"), // easy, medium, hard
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ttsGenerations = pgTable("tts_generations", {
  id: serial("id").primaryKey(),
  inputText: text("input_text").notNull(),
  audioData: text("audio_data").notNull(), // base64 encoded audio
  speed: text("speed").notNull().default("1.0"),
  pitch: text("pitch").notNull().default("1.0"),
  duration: integer("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRecordingSchema = createInsertSchema(recordings).omit({
  id: true,
  createdAt: true,
});

export const insertPhraseSchema = createInsertSchema(phrases).omit({
  id: true,
  createdAt: true,
  isRecorded: true,
  recordingId: true,
});

export const insertTtsGenerationSchema = createInsertSchema(ttsGenerations).omit({
  id: true,
  createdAt: true,
  audioData: true,
  duration: true,
});

export type Recording = typeof recordings.$inferSelect;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type Phrase = typeof phrases.$inferSelect;
export type InsertPhrase = z.infer<typeof insertPhraseSchema>;
export type TtsGeneration = typeof ttsGenerations.$inferSelect;
export type InsertTtsGeneration = z.infer<typeof insertTtsGenerationSchema>;
