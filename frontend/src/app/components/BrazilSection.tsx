import { useState } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function BrazilSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const jerseys = [
    {
      id: 1,
      mainImage: "https://images.unsplash.com/photo-1551479460-5e76c686816a?w=800",
      hoverImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
      name: "Brasil Retrô 1970"
    },
    {
      id: 2,
      mainImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
      hoverImage: "https://images.unsplash.com/photo-1551479460-5e76c686816a?w=800",
      name: "Brasil Retrô 1994"
    },
    {
      id: 3,
      mainImage: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800",
      hoverImage: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800",
      name: "Brasil 2002"
    },
    {
      id: 4,
      mainImage: "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800",
      hoverImage: "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800",
      name: "Brasil Atual"
    }
  ];

  return (
    <section className="py-12 px-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-black mb-6 flex items-center gap-2">
          Brasil <span className="text-2xl">🇧🇷</span>
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {jerseys.map((jersey, index) => (
            <motion.div
              key={jersey.id}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-black/10 hover:border-black transition-all"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              
              <motion.div
                className="w-full h-full"
                animate={{ 
                  opacity: hoveredIndex === index && index < 2 ? 0 : 1 
                }}
                transition={{ duration: 0.3 }}
              >
                <ImageWithFallback
                  src={jersey.mainImage}
                  alt={jersey.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              {index < 2 && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImageWithFallback
                    src={jersey.hoverImage}
                    alt={`${jersey.name} - Alternativa`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <p className="text-white font-semibold text-sm">{jersey.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
