import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const LEADERBOARD_API = 'https://functions.poehali.dev/11062142-0917-45a8-856b-92f32fe8d2c7';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_SIZE = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = CANVAS_WIDTH / BRICK_COLS;
const BRICK_HEIGHT = 30;
const BRICK_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

type Brick = { x: number; y: number; width: number; height: number; color: string; visible: boolean };
type Ball = { x: number; y: number; dx: number; dy: number };
type Paddle = { x: number; y: number };

const ArkanoidGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [savedScore, setSavedScore] = useState(false);

  const bricksRef = useRef<Brick[]>([]);
  const ballRef = useRef<Ball>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100, dx: 3, dy: -3 });
  const paddleRef = useRef<Paddle>({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 });
  const mouseXRef = useRef(CANVAS_WIDTH / 2);
  const animationRef = useRef<number>();

  const initBricks = useCallback(() => {
    const bricks: Brick[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: col * BRICK_WIDTH,
          y: row * BRICK_HEIGHT + 50,
          width: BRICK_WIDTH - 4,
          height: BRICK_HEIGHT - 4,
          color: BRICK_COLORS[row],
          visible: true,
        });
      }
    }
    bricksRef.current = bricks;
  }, []);

  const resetGame = useCallback(() => {
    ballRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100, dx: 3, dy: -3 };
    paddleRef.current = { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 };
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);
    setIsPlaying(true);
    setIsPaused(false);
    setShowNameInput(false);
    setSavedScore(false);
    initBricks();
  }, [initBricks]);

  const saveScore = async () => {
    if (!playerName.trim() || savedScore) return;

    try {
      await fetch(LEADERBOARD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: playerName.trim(),
          game_name: 'arkanoid',
          score
        })
      });
      setSavedScore(true);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  useEffect(() => {
    initBricks();
  }, [initBricks]);

  const checkCollision = useCallback(() => {
    const ball = ballRef.current;
    const paddle = paddleRef.current;

    if (ball.x + ball.dx > CANVAS_WIDTH - BALL_SIZE || ball.x + ball.dx < BALL_SIZE) {
      ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < BALL_SIZE) {
      ball.dy = -ball.dy;
    }

    if (
      ball.y + ball.dy > paddle.y - BALL_SIZE &&
      ball.x > paddle.x &&
      ball.x < paddle.x + PADDLE_WIDTH
    ) {
      const hitPos = (ball.x - paddle.x) / PADDLE_WIDTH;
      ball.dx = (hitPos - 0.5) * 8;
      ball.dy = -Math.abs(ball.dy);
    }

    if (ball.y + ball.dy > CANVAS_HEIGHT) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
          setIsPlaying(false);
        } else {
          ballRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100, dx: 3, dy: -3 };
        }
        return newLives;
      });
    }

    let allBricksDestroyed = true;
    bricksRef.current.forEach(brick => {
      if (brick.visible) {
        allBricksDestroyed = false;
        if (
          ball.x > brick.x &&
          ball.x < brick.x + brick.width &&
          ball.y > brick.y &&
          ball.y < brick.y + brick.height
        ) {
          ball.dy = -ball.dy;
          brick.visible = false;
          setScore(prev => prev + 10);
        }
      }
    });

    if (allBricksDestroyed && isPlaying) {
      setGameWon(true);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    bricksRef.current.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });

    const ball = ballRef.current;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fillStyle = '#4EEDCA';
    ctx.fill();
    ctx.closePath();

    const paddle = paddleRef.current;
    ctx.fillStyle = '#9B87F5';
    ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  }, []);

  const gameLoop = useCallback(() => {
    if (!isPlaying || isPaused || gameOver || gameWon) return;

    const ball = ballRef.current;
    const paddle = paddleRef.current;

    ball.x += ball.dx;
    ball.y += ball.dy;

    paddle.x = mouseXRef.current - PADDLE_WIDTH / 2;
    paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddle.x));

    checkCollision();
    draw();

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, isPaused, gameOver, gameWon, checkCollision, draw]);

  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver && !gameWon) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isPaused, gameOver, gameWon, gameLoop]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseXRef.current = e.clientX - rect.left;
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === ' ') {
        e.preventDefault();
        if (isPlaying) {
          setIsPaused(prev => !prev);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPlaying]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <Card className="border-primary/50 bg-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-2xl font-bold text-primary">Счёт: {score}</div>
              <div className="text-lg text-destructive">Жизни: {lives}</div>
            </div>
            <div className="flex gap-2">
              {!isPlaying && !gameOver && !gameWon && (
                <Button onClick={resetGame} className="bg-primary hover:bg-primary/80">
                  <Icon name="Play" size={20} className="mr-2" />
                  Старт
                </Button>
              )}
              {isPlaying && (
                <Button onClick={() => setIsPaused(!isPaused)} className="bg-secondary hover:bg-secondary/80">
                  <Icon name={isPaused ? "Play" : "Pause"} size={20} className="mr-2" />
                  {isPaused ? 'Продолжить' : 'Пауза'}
                </Button>
              )}
              {(gameOver || gameWon) && (
                <Button onClick={resetGame} className="bg-accent hover:bg-accent/80">
                  <Icon name="RotateCcw" size={20} className="mr-2" />
                  Играть снова
                </Button>
              )}
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-4 border-primary/30 bg-background"
          />

          {gameOver && (
            <div className="mt-4 text-center space-y-3">
              <p className="text-xl font-bold text-destructive">Игра окончена!</p>
              <p className="text-muted-foreground">Финальный счёт: {score}</p>
              {!showNameInput && !savedScore && score > 0 && (
                <Button onClick={() => setShowNameInput(true)} className="bg-accent hover:bg-accent/80">
                  Сохранить результат
                </Button>
              )}
              {showNameInput && !savedScore && (
                <div className="flex gap-2 max-w-sm mx-auto">
                  <Input
                    placeholder="Твоё имя"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={20}
                    onKeyPress={(e) => e.key === 'Enter' && saveScore()}
                  />
                  <Button onClick={saveScore} disabled={!playerName.trim()}>
                    <Icon name="Save" size={16} />
                  </Button>
                </div>
              )}
              {savedScore && (
                <p className="text-primary font-bold">✓ Результат сохранён!</p>
              )}
            </div>
          )}

          {gameWon && (
            <div className="mt-4 text-center space-y-3">
              <p className="text-xl font-bold text-primary">Победа!</p>
              <p className="text-muted-foreground">Финальный счёт: {score}</p>
              {!showNameInput && !savedScore && score > 0 && (
                <Button onClick={() => setShowNameInput(true)} className="bg-accent hover:bg-accent/80">
                  Сохранить результат
                </Button>
              )}
              {showNameInput && !savedScore && (
                <div className="flex gap-2 max-w-sm mx-auto">
                  <Input
                    placeholder="Твоё имя"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={20}
                    onKeyPress={(e) => e.key === 'Enter' && saveScore()}
                  />
                  <Button onClick={saveScore} disabled={!playerName.trim()}>
                    <Icon name="Save" size={16} />
                  </Button>
                </div>
              )}
              {savedScore && (
                <p className="text-primary font-bold">✓ Результат сохранён!</p>
              )}
            </div>
          )}

          {isPaused && (
            <div className="mt-4 text-center">
              <p className="text-xl font-bold text-secondary">Пауза</p>
            </div>
          )}

          {!isPlaying && !gameOver && !gameWon && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Управляй платформой мышкой</p>
              <p>Пробел или P — пауза</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArkanoidGame;