import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface LeaderboardEntry {
  player_name: string;
  score: number;
  created_at: string | null;
}

interface LeaderboardProps {
  gameName: string;
}

const LEADERBOARD_API = 'https://functions.poehali.dev/11062142-0917-45a8-856b-92f32fe8d2c7';

const Leaderboard = ({ gameName }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${LEADERBOARD_API}?game=${gameName}`);
        const data = await response.json();
        setEntries(data.leaderboard || []);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameName]);

  if (loading) {
    return (
      <Card className="border-primary/50 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Icon name="Trophy" size={24} />
            Таблица лидеров
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Загрузка...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon name="Trophy" size={24} />
          Топ-10 игроков
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            Пока нет рекордов. Стань первым!
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0
                    ? 'bg-accent/20 border-2 border-accent'
                    : index === 1
                    ? 'bg-secondary/20 border border-secondary/50'
                    : index === 2
                    ? 'bg-primary/10 border border-primary/50'
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xl font-bold ${
                      index === 0
                        ? 'text-accent'
                        : index === 1
                        ? 'text-secondary'
                        : index === 2
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <div>
                    <div className="font-semibold">{entry.player_name}</div>
                    {entry.created_at && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xl font-bold text-primary">{entry.score}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
