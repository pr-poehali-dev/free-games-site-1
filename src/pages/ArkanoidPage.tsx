import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ArkanoidGame from '@/components/games/ArkanoidGame';
import Leaderboard from '@/components/Leaderboard';

const ArkanoidPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-primary/30 bg-card shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/">
              <h1 className="text-4xl font-bold tracking-wider cursor-pointer" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                <span className="text-primary">ER</span>
                <span className="text-secondary">GO</span>
              </h1>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/10">
                <Icon name="Home" size={20} className="mr-2" />
                На главную
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-2 text-primary" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            ARKANOID
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Классический Arkanoid. Разбивай кирпичи и не дай мячу упасть!
          </p>
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <ArkanoidGame />
            <Leaderboard gameName="arkanoid" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArkanoidPage;