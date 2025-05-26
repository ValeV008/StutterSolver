import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Play, RotateCcw, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Phrase } from "@shared/schema";

export function PhraseLibrary() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPhraseText, setNewPhraseText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: phrases, isLoading } = useQuery<Phrase[]>({
    queryKey: ["/api/phrases"],
  });

  const addPhraseMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest("POST", "/api/phrases", {
        text: text.trim(),
        category: "custom",
        difficulty: "medium",
      });
    },
    onSuccess: () => {
      toast({
        title: "Phrase added",
        description: "Your custom phrase has been added successfully.",
      });
      setNewPhraseText("");
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/phrases"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add phrase. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddPhrase = () => {
    if (!newPhraseText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phrase.",
        variant: "destructive",
      });
      return;
    }

    if (newPhraseText.length > 200) {
      toast({
        title: "Error",
        description: "Phrase must be 200 characters or less.",
        variant: "destructive",
      });
      return;
    }

    addPhraseMutation.mutate(newPhraseText);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!phrases) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">Failed to load phrases.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Training Phrases</h3>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="text-sm text-primary hover:text-indigo-700">
                <Plus className="h-4 w-4 mr-1" />
                Add Custom Phrase
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Phrase</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phraseText">Phrase Text</Label>
                  <Textarea
                    id="phraseText"
                    value={newPhraseText}
                    onChange={(e) => setNewPhraseText(e.target.value)}
                    placeholder="Enter a phrase for training..."
                    maxLength={200}
                    rows={3}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {newPhraseText.length} / 200 characters
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddPhrase}
                    disabled={addPhraseMutation.isPending || !newPhraseText.trim()}
                    className="flex-1"
                  >
                    {addPhraseMutation.isPending ? "Adding..." : "Add Phrase"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {phrases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No phrases available. Add some phrases to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phrases.map((phrase, index) => (
              <div
                key={phrase.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">
                    Phrase #{(index + 1).toString().padStart(3, '0')}
                  </span>
                  <Badge
                    variant={phrase.isRecorded ? "default" : "secondary"}
                    className={
                      phrase.isRecorded
                        ? "bg-secondary text-white"
                        : "bg-gray-200 text-gray-600"
                    }
                  >
                    {phrase.isRecorded ? "Recorded" : "Pending"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  "{phrase.text}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {phrase.isRecorded ? "Completed" : "Not recorded"}
                  </span>
                  <div className="flex space-x-2">
                    {phrase.isRecorded ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-primary hover:text-indigo-700"
                          title="Play recording"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-primary hover:text-indigo-700"
                          title="Re-record"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-primary hover:text-indigo-700"
                        title="Record phrase"
                      >
                        <Mic className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-white text-xs">💡</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">Recording Tips for Best Results</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Record in a quiet environment with minimal background noise</li>
                <li>• Speak at your natural pace and volume</li>
                <li>• Position microphone 6-8 inches from your mouth</li>
                <li>• Complete at least 50 sample recordings for optimal results</li>
                <li>• Include a variety of sentence types and emotions</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
