import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Play, Pause, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDuration, base64ToBlob, downloadAudio } from "@/lib/audio-utils";
import type { TtsGeneration } from "@shared/schema";

export function TextToSpeech() {
  const [inputText, setInputText] = useState("Hello, this is a test of my AI-generated voice. I hope it sounds natural and clear.");
  const [speed, setSpeed] = useState("1.0");
  const [pitch, setPitch] = useState("1.0");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<TtsGeneration | null>(null);
  
  const { toast } = useToast();

  const generateSpeechMutation = useMutation({
    mutationFn: async (data: { inputText: string; speed: string; pitch: string }) => {
      const response = await apiRequest("POST", "/api/tts-generations", data);
      return response.json() as Promise<TtsGeneration>;
    },
    onSuccess: (data) => {
      setGeneratedAudio(data);
      toast({
        title: "Speech generated",
        description: "Your AI voice has been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateSpeech = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate speech.",
        variant: "destructive",
      });
      return;
    }

    if (inputText.length > 500) {
      toast({
        title: "Error",
        description: "Text must be 500 characters or less.",
        variant: "destructive",
      });
      return;
    }

    generateSpeechMutation.mutate({
      inputText: inputText.trim(),
      speed,
      pitch,
    });
  };

  const handlePlayAudio = () => {
    if (!generatedAudio) return;

    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
      return;
    }

    try {
      // In a real implementation, this would play the actual generated audio
      // For now, we'll simulate audio playback
      const audio = new Audio();
      
      // Create a simple beep sound as placeholder
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
      
      setIsPlaying(true);
      
      setTimeout(() => {
        setIsPlaying(false);
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to play audio.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAudio = () => {
    if (!generatedAudio) return;

    try {
      const blob = base64ToBlob(generatedAudio.audioData, 'audio/wav');
      downloadAudio(blob, `voice-clone-${Date.now()}.wav`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download audio.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Generate Speech</h3>
          <Badge className="bg-primary text-white">Model Ready</Badge>
        </div>

        {/* Text Input */}
        <div className="mb-6">
          <Label htmlFor="textInput" className="text-sm font-medium text-gray-700 mb-2 block">
            Enter text to generate speech:
          </Label>
          <Textarea
            id="textInput"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="resize-none"
            placeholder="Type the text you want to hear in your trained voice..."
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {inputText.length} / 500 characters
          </div>
        </div>

        {/* Voice Settings */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Speed</Label>
              <Select value={speed} onValueChange={setSpeed}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.8">Slow</SelectItem>
                  <SelectItem value="1.0">Normal</SelectItem>
                  <SelectItem value="1.2">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Pitch</Label>
              <Select value={pitch} onValueChange={setPitch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.8">Lower</SelectItem>
                  <SelectItem value="1.0">Normal</SelectItem>
                  <SelectItem value="1.2">Higher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateSpeech}
          disabled={generateSpeechMutation.isPending || !inputText.trim()}
          className="w-full bg-primary text-white hover:bg-indigo-700 mb-4"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {generateSpeechMutation.isPending ? "Generating..." : "Generate Speech"}
        </Button>

        {/* Audio Player */}
        {generatedAudio && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Generated Audio</span>
              <span className="text-xs text-gray-500">
                {formatDuration(generatedAudio.duration)}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handlePlayAudio}
                size="sm"
                className="w-10 h-10 rounded-full p-0 bg-primary text-white hover:bg-indigo-700"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-100" 
                  style={{ width: isPlaying ? "100%" : "0%" }}
                />
              </div>
              <Button
                onClick={handleDownloadAudio}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-primary"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
