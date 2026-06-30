import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';

interface Slide {
  image: string;
  badge: string;
  title: string;
  desc: string;
  buttonText: string;
  link: string;
}

const slides: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=1600',
    badge: 'Lançamento',
    title: 'Real Madrid 24/25',
    desc: 'O manto merengue para a nova temporada.',
    buttonText: 'Ver Camisa',
    link: '/product/1' // Exemplo de produto real
  },
  {
    image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1600',
    badge: 'Exclusivo',
    title: 'City Away 24/25',
    desc: 'Inovação e tradição em campo.',
    buttonText: 'Ver Camisa',
    link: '/product/2' // Exemplo de produto real
  }
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  // Rotacionar slides automaticamente a cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const handlePrev = () => {
    setCurrent(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="relative w-full h-[65vh] md:h-[75vh] mt-16 overflow-hidden bg-gray-150">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Imagem de Fundo */}
          <img 
            src={slides[current].image} 
            alt={slides[current].title} 
            className="w-full h-full object-cover"
          />
          
          {/* Gradiente Escuro no Fundo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          
          {/* Informações do Slide */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 text-white max-w-xl">
            <span className="bg-white text-black text-[9px] font-black uppercase px-3 py-1 mb-3 self-start tracking-widest rounded shadow-sm">
              {slides[current].badge}
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-2 uppercase leading-none font-cinzel tracking-tight">
              {slides[current].title}
            </h2>
            <p className="text-sm text-gray-300 mb-6 font-medium">
              {slides[current].desc}
            </p>
            <button
              onClick={() => navigate(slides[current].link)}
              className="bg-white text-black px-8 py-3.5 font-bold text-xs uppercase self-start hover:bg-black hover:text-white transition-colors duration-300 rounded-xl shadow-md"
            >
              {slides[current].buttonText}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controles de Chevron nas Laterais */}
      <div className="absolute bottom-6 right-6 flex gap-2 z-10">
        <button 
          onClick={handlePrev}
          className="w-10 h-10 bg-white/20 backdrop-blur border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors duration-300"
          aria-label="Slide anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={handleNext}
          className="w-10 h-10 bg-white/20 backdrop-blur border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors duration-300"
          aria-label="Próximo slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
