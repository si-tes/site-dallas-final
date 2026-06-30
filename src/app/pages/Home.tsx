import { useState } from 'react';
import HeroSection from '../components/HeroSection';
import ProductCarousel from '../components/ProductCarousel';
import BrazilSection from '../components/BrazilSection';
import NationalTeams from '../components/NationalTeams';
import GiftsSection from '../components/GiftsSection';
import CatalogSection from '../components/CatalogSection';
import { Truck, ShieldCheck, CreditCard, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import useProdutos from '../../hooks/useProdutos';
import { mapProdutoToVisual } from '../adapters/produtoMapper';

interface ProductCardData {
  id: string;
  name: string;
  price: number;
  image: string;
  img2?: string;
  team?: string;
}

export default function Home() {
  const { produtos, loading, erro } = useProdutos();

  // Converter produtos da API para formato do ProductCarousel usando o mapper dinâmico
  const produtosFormatados: ProductCardData[] = produtos.map((produto) => {
    const visual = mapProdutoToVisual(produto);
    return {
      id: visual.id,
      name: visual.name,
      price: visual.price,
      image: visual.image,
      img2: visual.img2,
      team: visual.cat,
    };
  });

  const benefits = [
    { icon: <Truck size={32} />, title: 'Frete Grátis', desc: 'Em compras acima de R$ 299' },
    { icon: <ShieldCheck size={32} />, title: 'Segurança', desc: 'Pagamento 100% protegido' },
    { icon: <CreditCard size={32} />, title: 'Até 12x', desc: 'Parcele suas compras' },
    { icon: <RotateCcw size={32} />, title: 'Troca Fácil', desc: '30 dias para devolver' },
  ];

  return (
    <div className="min-h-screen bg-white pb-10 relative">
      <main>
        {/* Banner Carrossel Deslizante */}
        <HeroSection />

        {/* SELETOR DE CATEGORIA GLOBAL (CLEAN & MODERN) */}
        <div className="container mx-auto px-4 pt-10 md:px-8">
          <div className="flex border-b border-gray-250">
            <button className="flex-1 pb-4 text-xs md:text-sm font-black uppercase tracking-widest text-center border-b-2 border-black transition-all">
              Camisas
            </button>
            <button className="flex-1 pb-4 text-xs md:text-sm font-black uppercase tracking-widest text-center border-b-2 border-transparent text-gray-400 hover:text-black transition-all">
              Shorts
            </button>
            <button className="flex-1 pb-4 text-xs md:text-sm font-black uppercase tracking-widest text-center border-b-2 border-transparent text-gray-400 hover:text-black transition-all">
              Chuteiras
            </button>
          </div>
        </div>
        
        {/* Benefícios (Bordas limpas, sem sombras ou detalhes vermelhos) */}
        <section className="container mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-gray-200"
              >
                <div className="text-black mb-3">{b.icon}</div>
                <h4 className="font-black uppercase tracking-tight text-xs md:text-sm">{b.title}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mensagens de Erro */}
        {erro && (
          <section className="container mx-auto px-4 md:px-8 py-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-800 font-bold">Erro ao carregar produtos: {erro}</p>
            </div>
          </section>
        )}

        {/* Carrossel de Mais Vendidas */}
        {loading ? (
          <section className="container mx-auto px-4 md:px-8 py-12">
            <div className="text-center py-12">
              <p className="text-gray-400 font-bold animate-pulse">Carregando produtos...</p>
            </div>
          </section>
        ) : (
          <div className="md:px-4">
            <ProductCarousel 
              title="Mais Vendidas (Brasileirão)" 
              products={produtosFormatados.length > 0 ? produtosFormatados : []} 
            />
          </div>
        )}
        
        <BrazilSection />
        
        <NationalTeams />
        
        <GiftsSection />
        
        <CatalogSection />
      </main>

      {/* Botão de WhatsApp Flutuante */}
      <a 
        href="https://wa.me/5531999999999?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20as%20camisas%20e%20chuteiras%20da%20Dalla%20Imports!"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#20ba5a] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-30 transition-all hover:scale-110"
      >
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.459 5.407 1.46h.007c5.567 0 10.105-4.54 10.109-10.112.002-2.699-1.046-5.238-2.951-7.146C17.306 1.456 14.773.407 12.01.408c-5.568 0-10.11 4.54-10.115 10.114-.001 1.9.5 3.754 1.45 5.36L2.34 21.096l5.307-1.394zm11.397-6.026c-.303-.153-1.8-.888-2.077-.989-.278-.102-.48-.153-.683.153-.202.306-.785.989-.96 1.192-.178.204-.355.229-.658.077-2.115-1.058-3.486-2.077-4.887-4.48-.37-.633.37-.588 1.06-1.95.163-.327.082-.613-.04-.866-.123-.254-.988-2.38-1.353-3.26-.354-.855-.714-.74-1.025-.74h-.543c-.203 0-.532.076-.81.38-.278.303-1.063 1.039-1.063 2.535 0 1.496 1.087 2.94 1.239 3.143.152.203 2.14 3.268 5.18 4.582.723.313 1.288.5 1.73.642.727.23 1.39.198 1.912.12.58-.087 1.8-.737 2.053-1.45.253-.713.253-1.32.177-1.45-.076-.127-.278-.203-.58-.356z"/>
        </svg>
      </a>

      {/* Footer Visual Limpo com estilo Cinzel e sem bordas vermelhas */}
      <footer className="mt-20 bg-black text-white py-16 px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-3xl font-black uppercase mb-6 tracking-tight font-cinzel text-white">
                Dalla Imports
              </h2>
              <p className="text-white/60 max-w-sm mb-8 text-sm">
                O Manto Sagrado Premium. Especialistas em camisas de time importadas com qualidade tailandesa 1:1 e chuteiras profissionais para o seu melhor rendimento em campo e futsal.
              </p>
            </div>
            <div>
              <h4 className="font-bold uppercase mb-4 text-xs tracking-widest text-gray-400">Links Úteis</h4>
              <ul className="space-y-3 text-white/50 font-bold uppercase text-[11px] tracking-wider">
                <li className="hover:text-white transition-colors cursor-pointer">Sobre Nós</li>
                <li className="hover:text-white transition-colors cursor-pointer">Política de Troca</li>
                <li className="hover:text-white transition-colors cursor-pointer">Rastrear Pedido</li>
                <li className="hover:text-white transition-colors cursor-pointer">Fale Conosco</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase mb-4 text-xs tracking-widest text-gray-400">Redes Sociais</h4>
              <ul className="space-y-3 text-white/50 font-bold uppercase text-[11px] tracking-wider">
                <li className="hover:text-white transition-colors cursor-pointer">Instagram</li>
                <li className="hover:text-white transition-colors cursor-pointer">WhatsApp</li>
                <li className="hover:text-white transition-colors cursor-pointer">Facebook</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
              © 2026 Dalla Imports. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}