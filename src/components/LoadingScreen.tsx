import { useEffect, useState } from "react";

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Absama Logo */}
        <div className="relative">
          <h1 className="text-8xl font-bold bg-gradient-absama bg-clip-text text-transparent animate-pulse">
            ABSAMA
          </h1>
          <div className="absolute inset-0 text-8xl font-bold text-accent/20 blur-sm">
            ABSAMA
          </div>
        </div>
        
        {/* Arena subtitle */}
        <h2 className="text-2xl font-semibold text-accent tracking-wider">
          ARENA
        </h2>
        
        {/* Loading bar */}
        <div className="w-80 mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-absama transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            Loading the table... {progress}%
          </p>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center space-x-4 mt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-accent animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};