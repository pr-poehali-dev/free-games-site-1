import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Direction = 'RIGHT';
const GAME_SPEED = 150;

const SnakeGame = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !isPlaying || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const currentDirection = directionRef.current;
      let newHead: Position;

      switch (currentDirection) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE ||
        prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameOver, isPlaying, isPaused, food, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused) return;

      const key = e.key;
      const currentDirection = directionRef.current;

      if ((key === 'ArrowUp' || key === 'w') && currentDirection !== 'DOWN') {
        directionRef.current = 'UP';
        setDirection('UP');
      } else if ((key === 'ArrowDown' || key === 's') && currentDirection !== 'UP') {
        directionRef.current = 'DOWN';
        setDirection('DOWN');
      } else if ((key === 'ArrowLeft' || key === 'a') && currentDirection !== 'RIGHT') {
        directionRef.current = 'LEFT';
        setDirection('LEFT');
      } else if ((key === 'ArrowRight' || key === 'd') && currentDirection !== 'LEFT') {
        directionRef.current = 'RIGHT';
        setDirection('RIGHT');
      } else if (key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isPaused]);

  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake, isPlaying, isPaused]);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <Card className="border-primary/50 bg-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold text-primary">Счёт: {score}</div>
            <div className="flex gap-2">
              {!isPlaying && !gameOver && (
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
              {gameOver && (
                <Button onClick={resetGame} className="bg-accent hover:bg-accent/80">
                  <Icon name="RotateCcw" size={20} className="mr-2" />
                  Играть снова
                </Button>
              )}
            </div>
          </div>

          <div
            className="relative border-4 border-primary/30 bg-background"
            style={{
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE,
            }}
          >
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute ${index === 0 ? 'bg-primary' : 'bg-primary/70'} rounded-sm`}
                style={{
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                  left: segment.x * CELL_SIZE + 1,
                  top: segment.y * CELL_SIZE + 1,
                }}
              />
            ))}
            <div
              className="absolute bg-accent rounded-full animate-pulse"
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                left: food.x * CELL_SIZE + 1,
                top: food.y * CELL_SIZE + 1,
              }}
            />
          </div>

          {gameOver && (
            <div className="mt-4 text-center">
              <p className="text-xl font-bold text-destructive">Игра окончена!</p>
              <p className="text-muted-foreground">Финальный счёт: {score}</p>
            </div>
          )}

          {isPaused && (
            <div className="mt-4 text-center">
              <p className="text-xl font-bold text-secondary">Пауза</p>
            </div>
          )}

          {!isPlaying && !gameOver && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Используй стрелки или WASD для управления</p>
              <p>Пробел — пауза</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SnakeGame;
