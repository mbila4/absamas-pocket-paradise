import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: 'cue' | 'solid' | 'stripe' | 'black';
  number?: number;
  potted: boolean;
}

interface GameState {
  currentPlayer: 1 | 2;
  balls: Ball[];
  gameOver: boolean;
  winner: number | null;
  score: { player1: number; player2: number };
  isAiming: boolean;
  aimAngle: number;
  aimPower: number;
}

export const PoolTable = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: 1,
    balls: [],
    gameOver: false,
    winner: null,
    score: { player1: 0, player2: 0 },
    isAiming: false,
    aimAngle: 0,
    aimPower: 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const tableWidth = 800;
  const tableHeight = 400;
  const pocketRadius = 25;

  // Initialize balls
  useEffect(() => {
    const initialBalls: Ball[] = [];
    
    // Cue ball
    initialBalls.push({
      id: 0,
      x: 200,
      y: tableHeight / 2,
      vx: 0,
      vy: 0,
      radius: 10,
      color: '#ffffff',
      type: 'cue',
      potted: false
    });

    // Rack formation (simplified triangle)
    const rackX = 600;
    const rackY = tableHeight / 2;
    const ballColors = ['#ffff00', '#0000ff', '#ff0000', '#800080', '#ffa500', '#008000', '#8b4513', '#000000'];
    
    for (let i = 0; i < 8; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      initialBalls.push({
        id: i + 1,
        x: rackX + row * 22,
        y: rackY + (col - 1) * 22,
        vx: 0,
        vy: 0,
        radius: 10,
        color: ballColors[i],
        type: i === 7 ? 'black' : (i < 4 ? 'solid' : 'stripe'),
        number: i + 1,
        potted: false
      });
    }

    setGameState(prev => ({ ...prev, balls: initialBalls }));
  }, []);

  // Physics simulation
  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, tableWidth, tableHeight);

      // Draw table background
      ctx.fillStyle = '#0f5132';
      ctx.fillRect(0, 0, tableWidth, tableHeight);

      // Draw table border
      ctx.strokeStyle = '#8b4513';
      ctx.lineWidth = 20;
      ctx.strokeRect(0, 0, tableWidth, tableHeight);

      // Draw Absama engraving in center
      ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
      ctx.font = 'bold 24px serif';
      ctx.textAlign = 'center';
      ctx.fillText('ABSAMA', tableWidth / 2, tableHeight / 2);

      // Draw pockets
      const pockets = [
        { x: 0, y: 0 },
        { x: tableWidth / 2, y: 0 },
        { x: tableWidth, y: 0 },
        { x: 0, y: tableHeight },
        { x: tableWidth / 2, y: tableHeight },
        { x: tableWidth, y: tableHeight }
      ];

      pockets.forEach(pocket => {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocketRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update ball positions
      setGameState(prev => {
        const newBalls = prev.balls.map(ball => {
          if (ball.potted) return ball;

          let newX = ball.x + ball.vx;
          let newY = ball.y + ball.vy;

          // Wall collisions
          if (newX <= ball.radius || newX >= tableWidth - ball.radius) {
            ball.vx = -ball.vx * 0.8;
            newX = Math.max(ball.radius, Math.min(tableWidth - ball.radius, newX));
          }
          if (newY <= ball.radius || newY >= tableHeight - ball.radius) {
            ball.vy = -ball.vy * 0.8;
            newY = Math.max(ball.radius, Math.min(tableHeight - ball.radius, newY));
          }

          // Check pocket collisions
          for (const pocket of pockets) {
            const dx = newX - pocket.x;
            const dy = newY - pocket.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < pocketRadius) {
              return { ...ball, potted: true };
            }
          }

          // Friction
          ball.vx *= 0.99;
          ball.vy *= 0.99;

          // Stop very slow balls
          if (Math.abs(ball.vx) < 0.1 && Math.abs(ball.vy) < 0.1) {
            ball.vx = 0;
            ball.vy = 0;
          }

          return { ...ball, x: newX, y: newY };
        });

        return { ...prev, balls: newBalls };
      });

      // Draw balls
      gameState.balls.forEach(ball => {
        if (ball.potted) return;

        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Ball number
        if (ball.type !== 'cue') {
          ctx.fillStyle = ball.type === 'black' ? '#ffffff' : '#000000';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(ball.number?.toString() || '', ball.x, ball.y + 3);
        }
      });

      // Draw aiming line
      if (gameState.isAiming) {
        const cueBall = gameState.balls.find(b => b.type === 'cue' && !b.potted);
        if (cueBall) {
          const length = gameState.aimPower * 100;
          const endX = cueBall.x + Math.cos(gameState.aimAngle) * length;
          const endY = cueBall.y + Math.sin(gameState.aimAngle) * length;

          ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(cueBall.x, cueBall.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [gameState.balls, gameState.isAiming, gameState.aimAngle, gameState.aimPower]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });
    setGameState(prev => ({ ...prev, isAiming: true }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cueBall = gameState.balls.find(b => b.type === 'cue' && !b.potted);
    if (!cueBall) return;

    const angle = Math.atan2(y - cueBall.y, x - cueBall.x);
    const distance = Math.sqrt((x - dragStart.x) ** 2 + (y - dragStart.y) ** 2);
    const power = Math.min(distance / 100, 2);

    setGameState(prev => ({
      ...prev,
      aimAngle: angle,
      aimPower: power
    }));
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);
    
    // Shoot the cue ball
    const cueBall = gameState.balls.find(b => b.type === 'cue' && !b.potted);
    if (cueBall) {
      const force = gameState.aimPower * 15;
      cueBall.vx = Math.cos(gameState.aimAngle) * force;
      cueBall.vy = Math.sin(gameState.aimAngle) * force;
    }

    setGameState(prev => ({
      ...prev,
      isAiming: false,
      currentPlayer: prev.currentPlayer === 1 ? 2 : 1
    }));
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Game header */}
      <Card className="p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-accent">Player 1</h3>
            <p className="text-2xl font-bold">{gameState.score.player1}</p>
            {gameState.currentPlayer === 1 && (
              <div className="w-2 h-2 bg-accent rounded-full mx-auto mt-2"></div>
            )}
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-absama bg-clip-text text-transparent">
              ABSAMA'S ARENA
            </h1>
            <p className="text-muted-foreground">Turn-based Pool</p>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-accent">Player 2</h3>
            <p className="text-2xl font-bold">{gameState.score.player2}</p>
            {gameState.currentPlayer === 2 && (
              <div className="w-2 h-2 bg-accent rounded-full mx-auto mt-2"></div>
            )}
          </div>
        </div>
      </Card>

      {/* Pool table */}
      <Card className="p-4 bg-table-rail">
        <canvas
          ref={canvasRef}
          width={tableWidth}
          height={tableHeight}
          className="cursor-crosshair border-4 border-accent/20 rounded-lg shadow-elegant"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </Card>

      {/* Controls */}
      <Card className="p-4 w-full max-w-4xl">
        <div className="flex justify-center space-x-4">
          <Button variant="outline">
            Reset Game
          </Button>
          <Button variant="absama">
            Player {gameState.currentPlayer}'s Turn
          </Button>
        </div>
      </Card>
    </div>
  );
};