import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard, { ProductCardProps } from './ProductCard';

// MOCK DATA: Ligas
const LEAGUES = [
  { id: 'premier', name: 'Premier League', logo: 'https://placehold.co/100x100/e0e0e0/000000?text=ENG' },
  { id: 'laliga', name: 'La Liga', logo: 'https://placehold.co/100x100/e0e0e0/000000?text=ESP' },
  { id: 'brasileirao', name: 'Brasileirão', logo: 'https://placehold.co/100x100/e0e0e0/000000?text=BRA' },
];

// MOCK DATA: Times
const TEAMS = {
  premier: [
    { id: 'ars', name: 'Arsenal', logo: 'https://placehold.co/100x100/ef0107/ffffff?text=ARS' },
    { id: 'city', name: 'Man City', logo: 'https://placehold.co/100x100/6cabdd/ffffff?text=MCI' },
    { id: 'utd', name: 'Man United', logo: 'https://placehold.co/100x100/da291c/ffffff?text=MUN' },
  ],
  laliga: [
    { id: 'real', name: 'Real Madrid', logo: 'https://placehold.co/100x100/ffffff/000000?text=RMA' },
    { id: 'barca', name: 'Barcelona', logo: 'https://placehold.co/100x100/004d98/a50044?text=BAR' },
  ],
  brasileirao: [
    { id: 'fla', name: 'Flamengo', logo: 'https://placehold.co/100x100/c62828/000000?text=FLA' },
    { id: 'pal', name: 'Palmeiras', logo: 'https://placehold.co/100x100/006437/ffffff?text=PAL' },
    { id: 'sao', name: 'São Paulo', logo: 'https://placehold.co/100x100/ffffff/ff0000?text=SAO' },
  ],
};

// MOCK DATA: Produtos
const PRODUCTS: Record<string, ProductCardProps[]> = {
  ars: [
    { id: 'p1', name: 'Arsenal Home 23/24', price: 349.90, image: 'https://images.unsplash.com/photo-1551479460-5e76c686816a?w=400', hoverImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400', team: 'Arsenal' },
  ],
  city: [
    { id: 'p2', name: 'Man City Away 23/24', price: 349.90, image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400', team: 'Man City' },
  ],
  utd: [
    { id: 'p3', name: 'Man United Home 23/24', price: 349.90, image: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400', team: 'Man United' },
  ],
  real: [
    { id: 'p4', name: 'Real Madrid Home 23/24', price: 399.90, image: 'https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=400', hoverImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400', team: 'Real Madrid' },
    { id: 'p5', name: 'Real Madrid Away 23/24', price: 399.90, image: 'https://images.unsplash.com/photo-1551479460-5e76c686816a?w=400', team: 'Real Madrid' },
  ],
  barca: [
    { id: 'p6', name: 'Barcelona Home 23/24', price: 399.90, image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400', team: 'Barcelona' },
  ],
  fla: [
    { id: 'p7', name: 'Flamengo Home 2024', price: 349.90, image: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400', team: 'Flamengo' },
  ],
  pal: [
    { id: 'p8', name: 'Palmeiras Home 2024', price: 349.90, image: 'https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=400', team: 'Palmeiras' },
  ],
  sao: [
    { id: 'p9', name: 'São Paulo Home 2024', price: 349.90, image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400', team: 'São Paulo' },
  ],
};

export default function FifaCarousel() {
  const [selectedLeague, setSelectedLeague] = useState(LEAGUES[0].id);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const handleLeagueClick = (leagueId: string) => {
    setSelectedLeague(leagueId);
    setSelectedTeam(null); // Reseta o time ao trocar de liga
  };

  const handleTeamClick = (teamId: string) => {
    // Se clicar no mesmo time que já está selecionado, ele desseleciona (mostrando a liga toda novamente)
    setSelectedTeam(prev => prev === teamId ? null : teamId);
  };

  // Pega os times da liga selecionada
  const currentTeams = TEAMS[selectedLeague as keyof typeof TEAMS] || [];

  // Pega os produtos a mostrar
  let displayedProducts: ProductCardProps[] = [];
  if (selectedTeam) {
    // Apenas do time selecionado
    displayedProducts = PRODUCTS[selectedTeam] || [];
  } else {
    // De todos os times da liga (ordem alfabética pelo nome)
    const allProductsInLeague = currentTeams.flatMap(t => PRODUCTS[t.id] || []);
    displayedProducts = allProductsInLeague.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <section className="py-12 bg-white px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-8 h-1 bg-red-600"></div>
          <h2 className="text-3xl md:text-5xl italic-black tracking-tighter uppercase font-black">
            Explorar <span className="text-red-600">Ligas</span>
          </h2>
        </div>

        {/* Abas de Ligas */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 mb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {LEAGUES.map(league => (
            <button
              key={league.id}
              onClick={() => handleLeagueClick(league.id)}
              className={`flex-none flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all italic-black uppercase tracking-wider text-sm font-bold ${
                selectedLeague === league.id 
                  ? 'border-black bg-black text-white' 
                  : 'border-black/10 text-black/50 hover:border-black/50'
              }`}
            >
              <img src={league.logo} alt={league.name} className="w-6 h-6 rounded-full object-cover" />
              {league.name}
            </button>
          ))}
        </div>

        {/* Carrossel de Times */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedLeague}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-6 mb-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {currentTeams.map(team => (
              <button
                key={team.id}
                onClick={() => handleTeamClick(team.id)}
                className={`flex-none flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  selectedTeam === team.id 
                    ? 'border-red-600 bg-red-50' 
                    : 'border-black/5 bg-gray-50 hover:border-black/20'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center p-2">
                  <img src={team.logo} alt={team.name} className="max-w-full max-h-full object-contain" />
                </div>
                <span className={`text-xs font-black uppercase tracking-widest italic ${
                  selectedTeam === team.id ? 'text-red-600' : 'text-black'
                }`}>
                  {team.name}
                </span>
              </button>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Grid de Produtos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {displayedProducts.map(product => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <ProductCard {...product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {displayedProducts.length === 0 && (
          <div className="py-12 text-center text-black/50 font-medium italic">
            Nenhum produto encontrado para esta seleção.
          </div>
        )}
      </div>
    </section>
  );
}
