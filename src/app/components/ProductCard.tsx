import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useState } from 'react';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage?: string;
  img2?: string;
  team?: string;
}

export default function ProductCard({ id, name, price, image, hoverImage, img2, team }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const secondaryImage = hoverImage || img2;

  return (
    <Link to={`/product/${id}`}>
      <motion.div 
        className="bg-white rounded-xl overflow-hidden border border-black/10 hover:border-black/35 transition-all cursor-pointer group shadow-sm hover:shadow-lg"
        whileHover={{ scale: 1.01, y: -4 }}
        whileTap={{ scale: 0.99 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
          <img 
            src={image} 
            alt={name} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'}`}
          />
          {secondaryImage && (
            <img 
              src={secondaryImage} 
              alt={`${name} - outro ângulo`} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
        </div>
        <div className="p-4">
          {team && (
            <p className="text-[10px] text-red-600 mb-1 font-black uppercase tracking-widest italic">{team}</p>
          )}
          <h3 className="text-black font-semibold mb-2 line-clamp-2 uppercase italic tracking-tight text-xs md:text-sm">{name}</h3>
          <div className="flex justify-between items-center">
            <p className="text-red-600 font-black text-base md:text-lg italic">
              R$ {price.toFixed(2).replace('.', ',')}
            </p>
            <span className="text-[9px] text-black/30 font-bold uppercase hidden sm:inline">12x s/ juros</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
