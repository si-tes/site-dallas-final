import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function GiftsSection() {
  const occasions = [
    {
      title: "Dia dos Namorados",
      description: "Presenteie com paixão",
      image: "https://images.unsplash.com/photo-1656821991459-ae723d90d648?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YWxlbnRpbmVzJTIwZGF5JTIwZ2lmdCUyMHJvbWFudGljfGVufDF8fHx8MTc3NDQ2Mjg4M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      icon: "💝"
    },
    {
      title: "Dia dos Pais",
      description: "O presente perfeito",
      image: "https://images.unsplash.com/photo-1762009365672-b42938e3089a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXRoZXJzJTIwZGF5JTIwZ2lmdCUyMHByZXNlbnR8ZW58MXx8fHwxNzc0NDYyODgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      icon: "👨‍👦"
    },
    {
      title: "Ocasiões Especiais",
      description: "Celebre momentos únicos",
      image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800",
      icon: "🎉"
    }
  ];

  return (
    <section className="py-8 px-4 bg-white">
      <h2 className="text-2xl font-bold text-black mb-6">Presentes</h2>
      
      <div className="space-y-4">
        {occasions.map((occasion, index) => (
          <motion.div
            key={occasion.title}
            className="relative h-[200px] rounded-xl overflow-hidden cursor-pointer border-2 border-black/10 hover:border-black transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
            <ImageWithFallback
              src={occasion.image}
              alt={occasion.title}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 flex flex-col justify-center p-6 z-20">
              <span className="text-4xl mb-2">{occasion.icon}</span>
              <h3 className="text-2xl font-bold text-white mb-1">{occasion.title}</h3>
              <p className="text-white/80 mb-4">{occasion.description}</p>
              <button className="bg-white text-black px-6 py-2 rounded-full font-bold w-fit hover:bg-black hover:text-white transition-colors border-2 border-white">
                Ver presentes
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
