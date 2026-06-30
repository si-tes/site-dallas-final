import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Search } from 'lucide-react';
import Header from '../components/Header';
import { listarProdutos, Produto } from '../../services/produtoService';
import { mapProdutoToVisual } from '../adapters/produtoMapper';
import ProductCard from '../components/ProductCard';
import HeroSection from '../components/HeroSection';
import ProductCarousel from '../components/ProductCarousel';
import BrazilSection from '../components/BrazilSection';
import NationalTeams from '../components/NationalTeams';
import GiftsSection from '../components/GiftsSection';
import CatalogSection from '../components/CatalogSection';

export default function Home() {
  const [termoBusca, setTermoBusca] = useState('');
  const [produtosAPI, setProdutosAPI] = useState<Produto[]>([]);
  
  const location = useLocation();

  useEffect(() => {
    listarProdutos()
      .then(res => setProdutosAPI(res.filter(p => p.ativo !== false)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (location.hash === '#search-products') {
      const searchInput = document.getElementById('search-products-input');
      if (searchInput) {
        setTimeout(() => {
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          searchInput.focus({ preventScroll: true });
        }, 100);
      }
    }
  }, [location]);

  const produtosFiltrados = termoBusca.trim() === '' 
    ? [] 
    : produtosAPI.filter(p => {
        const nome = p.nome || '';
        const desc = p.descricao || '';
        const term = termoBusca.toLowerCase();
        return nome.toLowerCase().includes(term) || desc.toLowerCase().includes(term);
      });

  const bestSellers = [
    {
      id: '1',
      name: 'Brasil Retrô 1970',
      price: 349.90,
      image: 'https://images.unsplash.com/photo-1551479460-5e76c686816a?w=400',
      team: 'Seleção Brasileira'
    },
    {
      id: '2',
      name: 'Argentina 1986 Maradona',
      price: 399.90,
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400',
      team: 'Seleção Argentina'
    },
    {
      id: '3',
      name: 'Brasil 1994 Romário',
      price: 379.90,
      image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400',
      team: 'Seleção Brasileira'
    },
    {
      id: '4',
      name: 'França 1998 Zidane',
      price: 389.90,
      image: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400',
      team: 'Seleção Francesa'
    },
    {
      id: '5',
      name: 'Itália 2006 Azzurri',
      price: 359.90,
      image: 'https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=400',
      team: 'Seleção Italiana'
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header />
      
      <main className="pt-24 md:pt-28">
        {/* BARRA DE PESQUISA - Movida para o topo para ser responsiva e visível no mobile imediatamente */}
        <div className="container mx-auto px-4 mb-8 max-w-4xl relative z-20">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              id="search-products-input"
              type="text" 
              placeholder="Buscar camisas, times, seleções..." 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl outline-none font-medium transition-all shadow-sm focus:shadow-md"
            />
          </div>
        </div>

        {termoBusca.trim() !== '' ? (
          <div className="container mx-auto px-4 py-4 max-w-6xl min-h-[50vh]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                Resultados para "{termoBusca}"
              </h2>
              <button 
                onClick={() => setTermoBusca('')} 
                className="text-sm font-bold underline hover:text-red-600 transition-colors"
              >
                Limpar busca
              </button>
            </div>
            
            {produtosFiltrados.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {produtosFiltrados.map(p => {
                  const visual = mapProdutoToVisual(p);
                  return <ProductCard key={visual.id} {...visual} hoverImage={visual.img2} />;
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">Nenhum produto encontrado para sua busca.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <HeroSection />
            <ProductCarousel title="Mais Vendidas" products={bestSellers} />
            <BrazilSection />
            <NationalTeams />
            <GiftsSection />
            <CatalogSection />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t-2 border-black py-8 px-4 bg-black">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Dalla Imports
          </h3>
          <p className="text-white/60 text-sm">
            Camisas de futebol com história e paixão
          </p>
          <p className="text-white/40 text-xs mt-4">
            © 2026 Dalla Imports. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
