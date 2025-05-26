import { Header } from "@/components/header";
import { ProgressOverview } from "@/components/progress-overview";
import { RecordingInterface } from "@/components/recording-interface";
import { TextToSpeech } from "@/components/text-to-speech";
import { PhraseLibrary } from "@/components/phrase-library";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Train Your AI Voice Model
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Create a personalized AI voice that speaks clearly and naturally. Record sample phrases to train your model and hear how you would sound without stuttering.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-primary text-white px-8 py-3 hover:bg-indigo-700">
              <Play className="h-4 w-4 mr-2" />
              Start Training
            </Button>
            <Button variant="outline" className="px-8 py-3">
              View Demo
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <ProgressOverview />

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RecordingInterface />
          <TextToSpeech />
        </div>

        {/* Phrase Library */}
        <PhraseLibrary />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-white text-xs">🎤</span>
                </div>
                <span className="font-semibold text-gray-800">VoiceClone</span>
              </div>
              <p className="text-sm text-gray-600">Empowering clear communication through AI voice technology.</p>
            </div>
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">Product</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">Support</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">Privacy</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Data Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-600">
            <p>&copy; 2024 VoiceClone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
