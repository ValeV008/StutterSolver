import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Save, X, Play, RotateCcw } from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useToast } from "@/hooks/use-toast";
import { formatDuration, blobToBase64 } from "@/lib/audio-utils";
import { apiRequest } from "@/lib/queryClient";
import type { Phrase } from "@shared/schema";

export function RecordingInterface() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: phrases, isLoading } = useQuery<Phrase[]>({
    queryKey: ["/api/phrases"],
  });

  const {
    isRecording,
    duration,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
    error,
  } = useAudioRecorder();

  const saveRecordingMutation = useMutation({
    mutationFn: async (data: { phraseId: number; audioData: string; duration: number }) => {
      return apiRequest("POST", "/api/recordings", {
        phraseId: data.phraseId,
        audioData: data.audioData,
        duration: data.duration,
        quality: "good",
      });
    },
    onSuccess: () => {
      toast({
        title: "Recording saved",
        description: "Your voice sample has been saved successfully.",
      });
      resetRecording();
      moveToNextPhrase();
      queryClient.invalidateQueries({ queryKey: ["/api/phrases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save recording. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentPhrase = phrases?.[currentPhraseIndex];

  const moveToNextPhrase = () => {
    if (phrases && currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
    } else {
      setCurrentPhraseIndex(0);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSaveRecording = async () => {
    if (!audioBlob || !currentPhrase) return;

    try {
      const audioData = await blobToBase64(audioBlob);
      saveRecordingMutation.mutate({
        phraseId: currentPhrase.id,
        audioData,
        duration,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process audio data.",
        variant: "destructive",
      });
    }
  };

  const handleDiscardRecording = () => {
    resetRecording();
    toast({
      title: "Recording discarded",
      description: "The recording has been discarded.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-6"></div>
            <div className="h-16 bg-gray-200 rounded mb-6"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!phrases || phrases.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">No phrases available for recording.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Record Voice Samples</h3>
          <Badge variant={isRecording ? "destructive" : "secondary"}>
            {isRecording ? "Recording" : audioBlob ? "Ready to Save" : "Ready"}
          </Badge>
        </div>

        {/* Current Phrase */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-500 mb-2">
            Read this phrase ({currentPhraseIndex + 1} of {phrases.length}):
          </div>
          <div className="text-lg font-medium text-gray-800">
            "{currentPhrase?.text}"
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Recording Controls */}
        <div className="text-center mb-6">
          <Button
            onClick={handleToggleRecording}
            size="lg"
            className={`w-20 h-20 rounded-full p-0 mb-4 shadow-lg hover:shadow-xl transition-all duration-200 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isRecording ? (
              <MicOff className="h-8 w-8 text-white" />
            ) : (
              <Mic className="h-8 w-8 text-white" />
            )}
          </Button>
          <div className="text-sm text-gray-600">
            {isRecording ? "Click to stop recording" : "Click to start recording"}
          </div>
        </div>

        {/* Audio Visualization */}
        <div className="bg-gray-100 rounded-lg h-16 mb-4 flex items-center justify-center">
          {isRecording ? (
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 30 + 15}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              {audioBlob ? "Recording complete" : "Audio visualization will appear here"}
            </div>
          )}
        </div>

        {/* Recording Timer */}
        <div className="text-center mb-4">
          <span className="text-2xl font-mono text-gray-800">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSaveRecording}
            disabled={!audioBlob || saveRecordingMutation.isPending}
            className="flex-1 bg-secondary text-white hover:bg-green-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveRecordingMutation.isPending ? "Saving..." : "Save Recording"}
          </Button>
          <Button
            onClick={handleDiscardRecording}
            variant="outline"
            disabled={!audioBlob}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Discard
          </Button>
        </div>

        {/* Next Phrase Button */}
        {!audioBlob && !isRecording && (
          <Button
            onClick={moveToNextPhrase}
            variant="ghost"
            className="w-full mt-3"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Skip to Next Phrase
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
