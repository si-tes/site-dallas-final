import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function HeroSection() {
  return (
    <motion.section 
      className="relative h-[500px] overflow-hidden rounded-2xl mx-4 mt-20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1551479460-5e76c686816a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRybyUyMGZvb3RiYWxsJTIwamVyc2V5JTIwY29sbGVjdGlvbiUyMHNob3B8ZW58MXx8fHwxNzc0NDYyODgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        alt="Relíquias do Futebol"
        className="w-full h-full object-cover"
      />
      
      <div className="absolute bottom-0 left-0 right-0 z-20 p-8">
        <motion.h2 
          className="text-4xl font-bold text-white mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Relíquias do Futebol
        </motion.h2>
        <motion.p 
          className="text-white/80 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Camisas históricas que marcaram época
        </motion.p>
        <motion.button 
          className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-black hover:text-white transition-all border-2 border-white"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Explorar agora
        </motion.button>
      </div>
    </motion.section>
  );
}
