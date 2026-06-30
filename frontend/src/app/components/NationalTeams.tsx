import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function NationalTeams() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const teams = [
    {
      name: "Argentina",
      flag: "🇦🇷",
      image: "https://images.unsplash.com/photo-1718337799103-f1080ce21ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmdlbnRpbmElMjBmb290YmFsbCUyMGplcnNleSUyMGJsdWUlMjB3aGl0ZXxlbnwxfHx8fDE3NzQ0NjI4ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      name: "França",
      flag: "🇫🇷",
      image: "https://images.unsplash.com/photo-1557456275-5bfe3c02223f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmFuY2UlMjBibHVlJTIwZm9vdGJhbGwlMjBqZXJzZXl8ZW58MXx8fHwxNzc0NDYyODgxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      name: "Alemanha",
      flag: "🇩🇪",
      image: "https://images.unsplash.com/photo-1759447946445-397b1c034768?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZXJtYW55JTIwZm9vdGJhbGwlMjBqZXJzZXklMjB3aGl0ZXxlbnwxfHx8fDE3NzQ0NjI4ODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      name: "Itália",
      flag: "🇮🇹",
      image: "https://images.unsplash.com/photo-1721477692606-09ead763e041?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFseSUyMGJsdWUlMjBmb290YmFsbCUyMGplcnNleXxlbnwxfHx8fDE3NzQ0NjI4ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      name: "Espanha",
      flag: "🇪🇸",
      image: "https://images.unsplash.com/photo-1668520193647-77e3106b3e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGFpbiUyMHJlZCUyMGZvb3RiYWxsJTIwamVyc2V5fGVufDF8fHx8MTc3NDQ2Mjg4Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    }
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 250;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-8 bg-white">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-2xl font-bold text-black">Encontre seu manto</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 bg-black rounded-full hover:bg-black/80 transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 bg-black rounded-full hover:bg-black/80 transition-colors"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {teams.map((team, index) => (
          <motion.div
            key={team.name}
            className="flex-none w-[180px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div 
              className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 border-black/10 hover:border-black transition-all"
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
              <ImageWithFallback
                src={team.image}
                alt={team.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <p className="text-white font-bold text-lg flex items-center gap-2">
                  {team.name}
                  <span className="text-xl">{team.flag}</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
