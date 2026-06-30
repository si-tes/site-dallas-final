import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { carrinhoService, ItemCarrinho } from '../../services/carrinhoService';

export default function Carrinho() {
  const navigate = useNavigate();
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [total, setTotal] = useState(0);

  // ─── Motor reaproveitado do Carrinho.tsx antigo ───────────────────────────
  const calcularTotal = (itensCarrinho: ItemCarrinho[]) => {
    const novoTotal = itensCarrinho.reduce(
      (acc, item) => acc + item.preco * item.quantidade,
      0
    );
    setTotal(novoTotal);
  };

  const carregarCarrinho = () => {
    const carrinhoAtual = carrinhoService.getCarrinho();
    setItens(carrinhoAtual);
    calcularTotal(carrinhoAtual);
  };

  useEffect(() => {
    carregarCarrinho();
    window.scrollTo(0, 0);
  }, []);

  const handleAtualizarQuantidade = (id: string, novaQuantidade: number) => {
    carrinhoService.atualizarQuantidade(id, novaQuantidade);
    carregarCarrinho();
    // Notifica o Header para atualizar o contador
    window.dispatchEvent(new Event('carrinhoAtualizado'));
  };

  const handleRemoverItem = (id: string) => {
    carrinhoService.removerDoCarrinho(id);
    carregarCarrinho();
    window.dispatchEvent(new Event('carrinhoAtualizado'));
  };
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-24 md:pt-28 pb-20 container mx-auto px-4 max-w-5xl">

        {/* Cabeçalho da página */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-sm text-gray-500 hover:text-black transition-colors font-medium"
          >
            <ArrowLeft size={16} /> Continuar Comprando
          </button>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
            Seu Carrinho
          </h1>
          {itens.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {itens.reduce((acc, i) => acc + i.quantidade, 0)} {itens.length === 1 ? 'item' : 'itens'}
            </p>
          )}
        </div>

        {/* Estado vazio */}
        {itens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#f5f5f5]">
            <ShoppingBag size={56} className="text-gray-300 mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Explore nosso catálogo e encontre o manto ideal.
            </p>
            <Link
              to="/"
              className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Ver Produtos
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 items-start">

            {/* ── Lista de Itens ── */}
            <div className="w-full lg:w-2/3 space-y-0 divide-y divide-gray-100">
              {itens.map((item) => (
                <div key={item.id} className="flex gap-5 py-6">

                  {/* Imagem */}
                  <div className="w-24 h-28 bg-[#f5f5f5] flex-shrink-0 overflow-hidden">
                    <img
                      src={item.imagem}
                      alt={item.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-produto.jpg';
                      }}
                    />
                  </div>

                  {/* Detalhes */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold uppercase text-sm tracking-tight leading-tight">
                          {item.nome}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1">
                          Tamanho: <span className="font-bold text-black">{item.tamanho}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoverItem(item.id)}
                        className="text-gray-300 hover:text-black transition-colors p-1 flex-shrink-0"
                        aria-label="Remover item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-4">
                      {/* Controle de Quantidade — mesmo estilo do ProductDetail */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleAtualizarQuantidade(item.id, item.quantidade - 1)}
                          disabled={item.quantidade <= 1}
                          className={`w-8 h-8 flex items-center justify-center border text-sm font-bold transition-all
                            ${item.quantidade <= 1
                              ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                              : 'border-gray-300 hover:border-black hover:bg-gray-50'}`}
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-sm">{item.quantidade}</span>
                        <button
                          onClick={() => handleAtualizarQuantidade(item.id, item.quantidade + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 text-sm font-bold hover:border-black hover:bg-gray-50 transition-all"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal do item */}
                      <div className="text-right">
                        <p className="text-[11px] text-gray-400">
                          R$ {Number(item.preco).toFixed(2).replace('.', ',')} cada
                        </p>
                        <p className="font-black text-base">
                          R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Resumo do Pedido — estilo dalla.html ── */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
              <div className="bg-[#f5f5f5] p-6 border border-gray-200">
                <h3 className="font-black uppercase tracking-tight text-sm mb-4 pb-4 border-b border-gray-200">
                  Resumo do Pedido
                </h3>

                <div className="space-y-2 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-black font-bold">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span className="text-xs text-gray-400">Calculado no checkout</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-black uppercase tracking-tight text-sm">Total Geral</span>
                  <span className="font-black text-xl">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Botão de Finalizar Compra */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors flex justify-center items-center gap-2"
                >
                  Finalizar Compra <ArrowRight size={16} />
                </button>

                <Link
                  to="/"
                  className="block text-center mt-4 text-xs text-gray-500 underline hover:text-black transition-colors"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
