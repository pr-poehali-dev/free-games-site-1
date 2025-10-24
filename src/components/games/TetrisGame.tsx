import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const LEADERBOARD_API = 'https://functions.poehali.dev/11062142-0917-45a8-856b-92f32fe8d2c7';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 25;

type Board = number[][];
type Piece = number[][];

const PIECES: Piece[] = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]], // Z
];

const COLORS = [
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-red-500',
];

const TetrisGame = () => {
  const [board, setBoard] = useState<Board>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece>(PIECES[0]);
  const [pieceColor, setPieceColor] = useState(0);
  const [position, setPosition] = useState({ x: 4, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [savedScore, setSavedScore] = useState(false);
  const speedRef = useRef(800);

  const createNewPiece = useCallback(() => {
    const pieceIndex = Math.floor(Math.random() * PIECES.length);
    setCurrentPiece(PIECES[pieceIndex]);
    setPieceColor(pieceIndex);
    setPosition({ x: 4, y: 0 });
  }, []);

  const checkCollision = useCallback((piece: Piece, pos: { x: number; y: number }, boardState: Board): boolean => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }
          
          if (newY >= 0 && boardState[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const mergePiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < currentPiece.length; y++) {
      for (let x = 0; x < currentPiece[y].length; x++) {
        if (currentPiece[y][x]) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = pieceColor + 1;
          }
        }
      }
    }

    let linesCleared = 0;
    const filteredBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (filteredBoard.length < BOARD_HEIGHT) {
      filteredBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }

    setBoard(filteredBoard);
    
    if (linesCleared > 0) {
      setScore(prev => prev + linesCleared * 100 * level);
      setLevel(prev => Math.floor((score + linesCleared * 100 * level) / 1000) + 1);
    }

    if (checkCollision(currentPiece, { x: 4, y: 0 }, filteredBoard)) {
      setGameOver(true);
      setIsPlaying(false);
    } else {
      createNewPiece();
    }
  }, [board, currentPiece, position, pieceColor, createNewPiece, checkCollision, level, score]);

  const moveDown = useCallback(() => {
    if (gameOver || !isPlaying || isPaused) return;

    const newPos = { x: position.x, y: position.y + 1 };
    
    if (checkCollision(currentPiece, newPos, board)) {
      mergePiece();
    } else {
      setPosition(newPos);
    }
  }, [position, currentPiece, board, checkCollision, mergePiece, gameOver, isPlaying, isPaused]);

  const moveHorizontal = useCallback((direction: number) => {
    if (gameOver || !isPlaying || isPaused) return;

    const newPos = { x: position.x + direction, y: position.y };
    
    if (!checkCollision(currentPiece, newPos, board)) {
      setPosition(newPos);
    }
  }, [position, currentPiece, board, checkCollision, gameOver, isPlaying, isPaused]);

  const rotatePiece = useCallback(() => {
    if (gameOver || !isPlaying || isPaused) return;

    const rotated = currentPiece[0].map((_, i) =>
      currentPiece.map(row => row[i]).reverse()
    );

    if (!checkCollision(rotated, position, board)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, position, board, checkCollision, gameOver, isPlaying, isPaused]);

  const hardDrop = useCallback(() => {
    if (gameOver || !isPlaying || isPaused) return;

    let newY = position.y;
    while (!checkCollision(currentPiece, { x: position.x, y: newY + 1 }, board)) {
      newY++;
    }
    setPosition({ x: position.x, y: newY });
    setTimeout(mergePiece, 50);
  }, [position, currentPiece, board, checkCollision, mergePiece, gameOver, isPlaying, isPaused]);

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    createNewPiece();
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);
    setShowNameInput(false);
    setSavedScore(false);
    speedRef.current = 800;
  };

  const saveScore = async () => {
    if (!playerName.trim() || savedScore) return;

    try {
      await fetch(LEADERBOARD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: playerName.trim(),
          game_name: 'tetris',
          score
        })
      });
      setSavedScore(true);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  useEffect(() => {
    speedRef.current = Math.max(200, 800 - (level - 1) * 100);
  }, [level]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          moveHorizontal(-1);
          break;
        case 'ArrowRight':
        case 'd':
          moveHorizontal(1);
          break;
        case 'ArrowDown':
        case 's':
          moveDown();
          break;
        case 'ArrowUp':
        case 'w':
          rotatePiece();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveHorizontal, moveDown, rotatePiece, hardDrop, isPlaying, isPaused]);

  useEffect(() => {
    if (!isPlaying || isPaused || gameOver) return;

    const interval = setInterval(moveDown, speedRef.current);
    return () => clearInterval(interval);
  }, [moveDown, isPlaying, isPaused, gameOver]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    for (let y = 0; y < currentPiece.length; y++) {
      for (let x = 0; x < currentPiece[y].length; x++) {
        if (currentPiece[y][x]) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = -(pieceColor + 1);
          }
        }
      }
    }

    return displayBoard;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <Card className="border-primary/50 bg-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-2xl font-bold text-primary">Счёт: {score}</div>
              <div className="text-lg text-muted-foreground">Уровень: {level}</div>
            </div>
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
            className="relative border-4 border-primary/30 bg-background grid gap-[1px] bg-muted/20"
            style={{
              width: BOARD_WIDTH * CELL_SIZE + 2,
              height: BOARD_HEIGHT * CELL_SIZE + 2,
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
            }}
          >
            {renderBoard().map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className={`border border-muted/10 ${
                    cell > 0 ? COLORS[cell - 1] :
                    cell < 0 ? COLORS[-cell - 1] + ' opacity-80' :
                    'bg-background'
                  }`}
                />
              ))
            )}
          </div>

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

          {isPaused && (
            <div className="mt-4 text-center">
              <p className="text-xl font-bold text-secondary">Пауза</p>
            </div>
          )}

          {!isPlaying && !gameOver && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>A/D или ←/→ - движение</p>
              <p>W или ↑ - поворот</p>
              <p>S или ↓ - ускорить</p>
              <p>Пробел - быстрое падение</p>
              <p>P - пауза</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TetrisGame;