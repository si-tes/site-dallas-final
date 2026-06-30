import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { obterProduto, obterGaleriaProduto, listarTamanhos, listarEstoqueComTamanhos } from '../../services/produtoService';
import { mapProdutoToVisual, VisualProduto } from '../adapters/produtoMapper';
import { carrinhoService } from '../../services/carrinhoService';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [visualData, setVisualData] = useState<VisualProduto | null>(null);
  
  // Estados da Fase 3
  const [tamanhosGlobais, setTamanhosGlobais] = useState<{ id: number, nome: string, acrescimo_preco: string }[]>([]);
  const [estoque, setEstoque] = useState<{ tamanho: string, quantidade: number }[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  // Estados da Fase 4
  const [quantidade, setQuantidade] = useState<number>(1);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado isolado exclusivo para a Galeria
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        setSelectedImage(null); 
        setSelectedSize('');
        setQuantidade(1);
        
        const [produtoDb, galeriaDb, tamanhosDb, estoqueDb] = await Promise.all([
          obterProduto(Number(id)),
          obterGaleriaProduto(Number(id)),
          listarTamanhos(),
          listarEstoqueComTamanhos(Number(id))
        ]);
        
        const produtoMapeado = mapProdutoToVisual(produtoDb, galeriaDb);
        setVisualData(produtoMapeado);
        setTamanhosGlobais(tamanhosDb);
        setEstoque(estoqueDb);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar o produto.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 pb-10 container mx-auto px-4 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <p className="text-xl font-bold text-gray-400 animate-pulse">Carregando produto...</p>
      </div>
    );
  }

  if (error || !visualData) {
    return (
      <div className="pt-32 pb-10 container mx-auto px-4 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <p className="text-xl font-bold text-red-600 mb-4">{error || 'Produto não encontrado'}</p>
        <button onClick={() => navigate('/')} className="text-black font-bold uppercase tracking-widest text-xs border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors">Voltar para a Loja</button>
      </div>
    );
  }

  const currentImage = selectedImage || visualData.image;

  // Lógica de Preço Dinâmico (Fase 3)
  const tamanhoObj = tamanhosGlobais.find(t => t.nome === selectedSize);
  const acrescimo = tamanhoObj && tamanhoObj.acrescimo_preco ? parseFloat(tamanhoObj.acrescimo_preco) : 0;
  const precoBase = visualData.price || 0;
  const precoFinal = precoBase + acrescimo;

  // Lógica de Carrinho (Fase 4)
  const itemEstoqueSelecionado = estoque.find(e => e.tamanho === selectedSize);
  const quantidadeMaxima = itemEstoqueSelecionado ? itemEstoqueSelecionado.quantidade : 0;

  const handleDecrease = () => {
    if (quantidade > 1) setQuantidade(quantidade - 1);
  };
  
  const handleIncrease = () => {
    if (quantidade < quantidadeMaxima) setQuantidade(quantidade + 1);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Selecione um tamanho primeiro.');
      return;
    }
    if (quantidade > quantidadeMaxima) {
      alert('Quantidade excede o estoque disponível.');
      return;
    }
    
    carrinhoService.adicionarAoCarrinho({
      produtoId: visualData.id.toString(),
      nome: visualData.name,
      preco: precoFinal,
      imagem: visualData.image,
      tamanho: selectedSize,
      tamanhoId: tamanhoObj?.id || 0,
      quantidade: quantidade
    });

    // Notifica o Header para atualizar o contador dinamicamente
    window.dispatchEvent(new Event('carrinhoAtualizado'));
    
    alert(`"${visualData.name}" (${selectedSize}) adicionado ao carrinho!`);
  };

  return (
    <section id="product" className="page pt-24 md:pt-32 pb-20">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-8 font-medium text-sm text-gray-500 hover:text-black transition-colors">
            <ArrowLeft size={16} /> Voltar
        </button>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
            {/* Imagem e Galeria */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div className="bg-[#f5f5f5] aspect-[4/5] relative w-full overflow-hidden">
                    <img src={currentImage} alt={visualData.name} className="w-full h-full object-cover transition-opacity duration-300" />
                </div>
                {/* Miniaturas (Ângulos) */}
                {visualData.gallery && visualData.gallery.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2" id="detail-gallery">
                      {visualData.gallery.map((img, index) => (
                        <button 
                          key={index} 
                          onClick={() => setSelectedImage(img)}
                          className={`w-20 h-24 flex-shrink-0 bg-[#f5f5f5] border-2 transition-all overflow-hidden ${currentImage === img ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                        >
                          <img src={img} alt={`Ângulo ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                  </div>
                )}
            </div>

            {/* Informações */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
                <div className="mb-6">
                    <span className="text-gray-500 text-sm mb-2 block">{visualData.cat}</span>
                    <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight leading-none mb-4">{visualData.name}</h2>
                    <div className="flex items-baseline gap-4 mb-2">
                        <p className="text-2xl font-black">R$ {precoFinal.toFixed(2).replace('.', ',')}</p>
                    </div>
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                    {visualData.description}
                </p>

                {/* Seleção de Tamanhos (Fase 3) */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold uppercase text-xs tracking-wider">Selecione o Tamanho</h3>
                        <a href="#" onClick={(e) => { e.preventDefault(); alert('Tabela de Medidas será implementada futuramente'); }} className="text-xs underline text-gray-500">Tabela de Medidas</a>
                    </div>
                    <div className="grid grid-cols-5 gap-2" id="size-options-grid">
                        {tamanhosGlobais.map(tamanho => {
                          const itemE = estoque.find(e => e.tamanho === tamanho.nome);
                          const qtd = itemE ? itemE.quantidade : 0;
                          const isAvailable = qtd > 0;
                          const isSelected = selectedSize === tamanho.nome;
                          
                          return (
                            <button
                              key={tamanho.id}
                              disabled={!isAvailable}
                              onClick={() => {
                                setSelectedSize(tamanho.nome);
                                setQuantidade(1);
                              }}
                              className={`py-3 text-xs font-bold uppercase tracking-widest border transition-all 
                                ${isSelected ? 'bg-black text-white border-black' : ''}
                                ${!isAvailable ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50' : 'bg-white text-black border-gray-300 hover:border-black hover:bg-gray-50'}
                              `}
                            >
                              {tamanho.nome}
                            </button>
                          );
                        })}
                    </div>
                </div>

                {/* Quantidade (Fase 4) */}
                <div className="flex items-center gap-6 mb-8">
                    <p className="font-bold uppercase text-xs tracking-wider">Quantidade</p>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleDecrease}
                            disabled={quantidade <= 1}
                            className={`w-10 h-10 flex items-center justify-center border transition-all ${quantidade <= 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 hover:border-black hover:bg-gray-50'}`}>
                            -
                        </button>
                        <span className="w-4 text-center font-bold text-sm">{quantidade}</span>
                        <button 
                            onClick={handleIncrease}
                            disabled={quantidade >= quantidadeMaxima || !selectedSize}
                            className={`w-10 h-10 flex items-center justify-center border transition-all ${quantidade >= quantidadeMaxima || !selectedSize ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 hover:border-black hover:bg-gray-50'}`}>
                            +
                        </button>
                    </div>
                </div>

                <button onClick={handleAddToCart}
                    className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors flex justify-center items-center gap-2">
                    Adicionar ao Carrinho <ArrowRight size={18} />
                </button>
            </div>
        </div>
      </div>
    </section>
  );
}