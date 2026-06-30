import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

import { carrinhoService, ItemCarrinho } from '../../services/carrinhoService';
import { useAuth } from '../../contexts/AuthContext';

export default function Carrinho() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [total, setTotal] = useState(0);

  const carregarCarrinho = () => {
    const carrinhoAtual = carrinhoService.getCarrinho();
    setItens(carrinhoAtual);
    calcularTotal(carrinhoAtual);
  };

  useEffect(() => {
    carregarCarrinho();
    window.scrollTo(0, 0);
  }, []);

  const calcularTotal = (itensCarrinho: ItemCarrinho[]) => {
    const novoTotal = itensCarrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    setTotal(novoTotal);
  };

  const handleAtualizarQuantidade = (id: string, novaQuantidade: number) => {
    carrinhoService.atualizarQuantidade(id, novaQuantidade);
    carregarCarrinho();
  };

  const handleRemoverItem = (id: string) => {
    carrinhoService.removerDoCarrinho(id);
    carregarCarrinho();
  };

  return (
    <div className="min-h-screen bg-white">


      <main className="pt-24 md:pt-32 pb-20 container mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-black text-black uppercase italic tracking-tighter mb-8">
          Seu Carrinho
        </h1>

        {itens.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-20 bg-[#f5f5f5] rounded-3xl border border-black/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingBag size={64} className="text-black/20 mb-6" />
            <h2 className="text-2xl font-black uppercase italic mb-4">Seu carrinho está vazio</h2>
            <p className="text-black/60 font-medium mb-8">Parece que você ainda não escolheu seus produtos.</p>
            <Link 
              to="/" 
              className="bg-black text-white px-8 py-4 rounded-full font-black uppercase italic tracking-widest hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Continuar Comprando
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Lista de Itens */}
            <div className="w-full lg:w-2/3 space-y-6">
              {itens.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col sm:flex-row gap-6 p-4 sm:p-6 bg-[#f5f5f5] rounded-3xl border border-black/5 relative"
                >
                  {/* Imagem */}
                  <div className="w-full sm:w-32 h-40 sm:h-32 bg-white rounded-2xl overflow-hidden flex-shrink-0">
                    <ImageWithFallback 
                      src={item.imagem} 
                      alt={item.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Detalhes */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-xl font-black uppercase italic leading-tight">{item.nome}</h3>
                        <button 
                          onClick={() => handleRemoverItem(item.id)}
                          className="text-black/40 hover:text-red-600 transition-colors p-2 -mr-2 -mt-2"
                          aria-label="Remover item"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <p className="text-black/60 font-bold text-sm mt-1">Tamanho: {item.tamanho}</p>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap justify-between items-end gap-4 mt-4">
                      {/* Controle de Quantidade */}
                      <div className="flex items-center bg-white rounded-full px-4 py-1 border border-black/5 shadow-sm">
                        <button 
                          onClick={() => handleAtualizarQuantidade(item.id, item.quantidade - 1)}
                          className="text-xl font-black p-1 hover:text-red-600 transition-colors w-8"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-black italic">{item.quantidade}</span>
                        <button 
                          onClick={() => handleAtualizarQuantidade(item.id, item.quantidade + 1)}
                          className="text-xl font-black p-1 hover:text-red-600 transition-colors w-8"
                        >
                          +
                        </button>
                      </div>

                      {/* Preço Unitário e Subtotal */}
                      <div className="text-right">
                        <p className="text-xs text-black/40 font-bold mb-1">R$ {Number(item.preco).toFixed(2).replace('.', ',')} cada</p>
                        <p className="text-2xl font-black text-red-600 italic">
                          R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Resumo do Pedido */}
            <div className="w-full lg:w-1/3">
              <div className="bg-black text-white rounded-3xl p-8 sticky top-32 shadow-2xl">
                <h3 className="text-2xl font-black uppercase italic mb-6">Resumo</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-white/80 font-medium">
                    <span>Subtotal</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-white/80 font-medium">
                    <span>Frete</span>
                    <span className="text-sm italic text-white/60">Calculado no checkout</span>
                  </div>
                </div>

                <div className="h-px bg-white/20 w-full mb-6" />

                <div className="flex justify-between items-end mb-8">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-3xl font-black text-red-500 italic">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login?redirect=/checkout');
                    } else {
                      navigate('/checkout');
                    }
                  }}
                  className="w-full bg-red-600 text-white py-4 rounded-full font-black text-lg uppercase italic tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-colors block text-center"
                >
                  Finalizar Compra
                </button>

                <div className="mt-4 text-center">
                  <Link to="/" className="text-xs text-white/60 font-bold uppercase underline hover:text-white transition-colors">
                    Continuar Comprando
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
