import { useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PoolTable } from "@/components/PoolTable";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'menu' | 'game'>('menu');

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  if (currentView === 'game') {
    return (
      <div className="min-h-screen bg-background">
        {/* Absama watermark */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl font-bold text-accent/5 select-none">
            ABSAMA
          </div>
        </div>
        
        {/* Header */}
        <header className="p-4 border-b border-border">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('menu')}
              className="text-accent hover:text-accent/80"
            >
              ← Back to Menu
            </Button>
            
            <h1 className="text-2xl font-bold bg-gradient-absama bg-clip-text text-transparent">
              ABSAMA'S ARENA
            </h1>
            
            <PlayerAvatar size="md" />
          </div>
        </header>

        {/* Game area */}
        <main className="max-w-6xl mx-auto">
          <PoolTable />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Absama watermark */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl font-bold text-accent/5 select-none">
          ABSAMA
        </div>
      </div>

      <Card className="p-8 w-full max-w-md space-y-8 text-center shadow-elegant">
        {/* Logo */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-absama bg-clip-text text-transparent">
            ABSAMA
          </h1>
          <h2 className="text-xl font-semibold text-accent tracking-wider">
            ARENA
          </h2>
          <p className="text-muted-foreground">
            Premium Turn-based Pool Experience
          </p>
        </div>

        {/* Player Avatar */}
        <div className="flex justify-center">
          <PlayerAvatar size="lg" />
        </div>

        {/* Menu Options */}
        <div className="space-y-4">
          <Button
            variant="absama"
            size="lg"
            className="w-full"
            onClick={() => setCurrentView('game')}
          >
            Start Local Game
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            disabled
          >
            Online Matchmaking
            <span className="text-xs text-muted-foreground ml-2">(Coming Soon)</span>
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
          >
            Settings
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Crafted with precision by Absama
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Index;