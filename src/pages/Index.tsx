import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Game {
  id: number;
  title: string;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  isNew: boolean;
  link?: string;
}

const games: Game[] = [
  {
    id: 1,
    title: "Snake",
    category: "Аркада",
    rating: 4.8,
    reviews: 2847,
    image: "https://cdn.poehali.dev/projects/9f1f54c0-d2ef-4df8-ad3b-73ca21b5c7c1/files/ab9cac2e-c667-4027-aa87-400cea8f353d.jpg",
    isNew: true,
    link: "/snake"
  },
  {
    id: 2,
    title: "Tetris",
    category: "Головоломка",
    rating: 4.9,
    reviews: 3421,
    image: "https://cdn.poehali.dev/projects/9f1f54c0-d2ef-4df8-ad3b-73ca21b5c7c1/files/2318b1ff-f868-4ccb-920b-1ccbc413ae47.jpg",
    isNew: true,
    link: "/tetris"
  },
  {
    id: 3,
    title: "Arkanoid",
    category: "Аркада",
    rating: 4.7,
    reviews: 2156,
    image: "https://cdn.poehali.dev/projects/9f1f54c0-d2ef-4df8-ad3b-73ca21b5c7c1/files/faa4e315-df43-4455-9ac9-9c7aea6fb454.jpg",
    isNew: true,
    link: "/arkanoid"
  },
  {
    id: 4,
    title: "Pixel Runner",
    category: "Платформер",
    rating: 4.6,
    reviews: 1923,
    image: "https://cdn.poehali.dev/projects/9f1f54c0-d2ef-4df8-ad3b-73ca21b5c7c1/files/ab9cac2e-c667-4027-aa87-400cea8f353d.jpg",
    isNew: false
  },
  {
    id: 5,
    title: "Retro Fighter",
    category: "Файтинг",
    rating: 4.5,
    reviews: 1678,
    image: "https://cdn.poehali.dev/projects/9f1f54c0-d2ef-4df8-ad3b-73ca21b5c7c1/files/2318b1ff-f868-4ccb-920b-1ccbc413ae47.jpg",
    isNew: false
  },
  {
    id: 6,
    title: "Maze Master",
    category: "Головоломка",
    rating: 4.4,
    reviews: 1234,
    image: "https://cdn.poehali.dev/projects/9f1f54c0-d2ef-4df8-ad3b-73ca21b5c7c1/files/faa4e315-df43-4455-9ac9-9c7aea6fb454.jpg",
    isNew: false
  }
];

const GameCard = ({ game }: { game: Game }) => {
  const [userRating, setUserRating] = useState(0);

  return (
    <Card className="group overflow-hidden border-primary/30 bg-card hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(78,237,202,0.3)]">
      <div className="relative overflow-hidden aspect-video">
        <img 
          src={game.image} 
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {game.isNew && (
          <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground font-bold animate-pulse">
            NEW
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
            {game.title}
          </h3>
          <Badge variant="outline" className="text-xs border-primary/50">
            {game.category}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                name="Star"
                size={16}
                className={`cursor-pointer transition-colors ${
                  star <= (userRating || game.rating)
                    ? 'fill-accent text-accent'
                    : 'text-muted-foreground'
                }`}
                onClick={() => setUserRating(star)}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {game.rating} ({game.reviews})
          </span>
        </div>

        {game.link ? (
          <Link to={game.link}>
            <Button 
              className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold border-2 border-primary-foreground/20 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]"
            >
              <Icon name="Gamepad2" size={16} className="mr-2" />
              Играть
            </Button>
          </Link>
        ) : (
          <Button 
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold border-2 border-primary-foreground/20 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]"
            disabled
          >
            <Icon name="Gamepad2" size={16} className="mr-2" />
            Скоро
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredGames = games.filter(game => {
    if (activeTab === 'top') return game.rating >= 4.7;
    if (activeTab === 'new') return game.isNew;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-primary/30 bg-card shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold tracking-wider" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              <span className="text-primary">ER</span>
              <span className="text-secondary">GO</span>
            </h1>
            <nav className="flex gap-4 items-center">
              <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/10">
                <Icon name="Home" size={20} className="mr-2" />
                Главная
              </Button>
              <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/10">
                <Icon name="Info" size={20} className="mr-2" />
                О сайте
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <section className="py-16 px-4 bg-gradient-to-b from-card to-background border-b-4 border-primary/20">
        <div className="container mx-auto text-center">
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6 text-primary animate-pulse"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            #FREE ARCADE GAMES
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Погрузись в мир классических аркадных игр! Тысячи бесплатных игр ждут тебя. 
            Никаких загрузок, играй прямо в браузере!
          </p>
          <Button 
            size="lg"
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xl px-8 py-6 font-bold border-4 border-background shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            <Icon name="Gamepad2" size={24} className="mr-3" />
            PLAY NOW!
          </Button>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-card border-2 border-primary/30 p-1">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold"
              >
                <Icon name="Grid3x3" size={16} className="mr-2" />
                Все игры
              </TabsTrigger>
              <TabsTrigger 
                value="top"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold"
              >
                <Icon name="Trophy" size={16} className="mr-2" />
                Топ
              </TabsTrigger>
              <TabsTrigger 
                value="new"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold"
              >
                <Icon name="Sparkles" size={16} className="mr-2" />
                Новинки
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 px-4 bg-card border-t-4 border-primary/20">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 
            className="text-3xl font-bold mb-6 text-primary"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            О сайте
          </h2>
          <p className="text-lg text-muted-foreground mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
            ERGO — это портал бесплатных ретро-игр, вдохновлённых классическими аркадами 80-х и 90-х годов.
            Все игры запускаются прямо в браузере без установки.
          </p>
          <p className="text-lg text-muted-foreground" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Оценивай игры, оставляй отзывы и делись своими достижениями с другими игроками!
          </p>
        </div>
      </section>

      <footer className="py-8 px-4 bg-background border-t-4 border-primary/30">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground" style={{ fontFamily: 'Roboto, sans-serif' }}>
            © 2024 ERGO. Все игры бесплатны для игры.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;