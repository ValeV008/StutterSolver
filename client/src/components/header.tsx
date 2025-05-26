import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">VoiceClone</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">Dashboard</a>
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">Recordings</a>
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">Settings</a>
            <Button className="bg-primary text-white hover:bg-indigo-700">
              Get Started
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
