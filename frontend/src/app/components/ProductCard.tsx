import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useState } from 'react';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage?: string;
  team?: string;
}

export default function ProductCard({ id, name, price, image, hoverImage, team }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={`/product/${id}`}>
      <motion.div 
        className="bg-white rounded-xl overflow-hidden border-2 border-black/10 hover:border-black transition-all cursor-pointer group"
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
          <img 
            src={image} 
            alt={name} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered && hoverImage ? 'opacity-0' : 'opacity-100'}`}
          />
          {hoverImage && (
            <img 
              src={hoverImage} 
              alt={`${name} - outro ângulo`} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
        </div>
        <div className="p-4">
          {team && (
            <p className="text-[10px] text-red-600 mb-1 font-black uppercase tracking-widest italic">{team}</p>
          )}
          <h3 className="text-black font-semibold mb-2 line-clamp-2 uppercase italic tracking-tight">{name}</h3>
          <p className="text-red-600 font-black text-lg italic">
            R$ {price.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
