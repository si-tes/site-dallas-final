import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { motion } from 'motion/react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  img2?: string;
  team?: string;
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
}

export default function ProductCarousel({ title, products }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-10 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">Mantos Premium</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">{title}</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 border border-gray-200 rounded-full hover:bg-black hover:text-white hover:border-black transition-colors duration-300"
              aria-label="Rolar para esquerda"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 border border-gray-200 rounded-full hover:bg-black hover:text-white hover:border-black transition-colors duration-300"
              aria-label="Rolar para direita"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product, index) => (
            <motion.div 
              key={product.id} 
              className="flex-none w-[260px] md:w-[280px]"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
