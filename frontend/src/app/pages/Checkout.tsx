import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router';
import { Trash2, AlertCircle, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

import { carrinhoService, ItemCarrinho } from '../../services/carrinhoService';
import { pedidoService } from '../../services/pedidoService';
import { cupomService, Cupom } from '../../services/cupomService';
import { useAuth } from '../../contexts/AuthContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();
  
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [total, setTotal] = useState(0);
  const [valorFrete, setValorFrete] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [cupomCodigoInput, setCupomCodigoInput] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState<Cupom | null>(null);
  const [cupomLoading, setCupomLoading] = useState(false);
  const [cupomError, setCupomError] = useState<string | null>(null);
  const [valorDesconto, setValorDesconto] = useState(0);

  // Inicializa o state considerando que o user pode já estar disponível
  const [formData, setFormData] = useState({
    usuario_id: user?.id,
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: '',
    cpf: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualiza formData se o user mudar (caso a página monte antes da API retornar o usuário)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        usuario_id: user.id,
        nome: user.nome || prev.nome,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Carrega o carrinho
  useEffect(() => {
    if (loading) return; // Se está carregando, nem faz nada ainda
    const carrinhoAtual = carrinhoService.getCarrinho();
    if (carrinhoAtual.length === 0) {
      navigate('/carrinho');
      return;
    }
    setItens(carrinhoAtual);
    const novoTotal = carrinhoAtual.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    setTotal(novoTotal);
    window.scrollTo(0, 0);
  }, [navigate, loading]);

  // Lógica de cálculo de frete
  useEffect(() => {
    const cidadeNormalizada = formData.cidade
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();
      
    const todosEstoqueLocal = itens.every(item => item.estoqueLocal === true);
    
    let freteCalculado = 40;
    if (!cidadeNormalizada) {
      freteCalculado = 0;
    } else if (cidadeNormalizada === 'ARAXA') {
      if (todosEstoqueLocal) {
        freteCalculado = 12;
      } else {
        freteCalculado = 40;
      }
    } else {
      freteCalculado = 40;
    }

    setValorFrete(freteCalculado);
  }, [formData.cidade, itens]);

  // Cálculo de desconto do cupom
  useEffect(() => {
    if (!cupomAplicado) {
      setValorDesconto(0);
      return;
    }
    let desconto = 0;
    const valorCupom = Number(cupomAplicado.valor);
    if (cupomAplicado.tipo_desconto === 'percentual') {
      desconto = total * (valorCupom / 100);
    } else if (cupomAplicado.tipo_desconto === 'fixo') {
      desconto = valorCupom;
    }
    const descontoFinal = Math.min(desconto, total);
    setValorDesconto(descontoFinal);
  }, [total, cupomAplicado, valorFrete]);

  const handleApplyCupom = async () => {
    if (!cupomCodigoInput.trim()) return;
    setCupomLoading(true);
    setCupomError(null);
    try {
      const cupom = await cupomService.validarCupom(cupomCodigoInput.trim());
      setCupomAplicado(cupom);
      setCupomCodigoInput('');
    } catch (error: any) {
      setCupomError(error.message || 'Cupom inválido');
      setCupomAplicado(null);
    } finally {
      setCupomLoading(false);
    }
  };

  const handleRemoverCupom = () => {
    setCupomAplicado(null);
    setValorDesconto(0);
    setCupomError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateDetails = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ['nome', 'email', 'telefone', 'cpf', 'cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
    
    requiredFields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      if (typeof value === 'string' && !value.trim()) {
        newErrors[field] = 'Campo obrigatório';
      } else if (!value) {
        newErrors[field] = 'Campo obrigatório';
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (formData.cpf) {
      const cpfNumeros = formData.cpf.replace(/\D/g, '');
      if (cpfNumeros.length !== 11) {
        newErrors.cpf = 'CPF deve conter 11 dígitos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateDetails()) {
      setStep('payment');
      window.scrollTo(0, 0);
    }
  };

  const handlePayment = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const payload = {
        ...formData,
        usuario_id: user?.id // Garantia final de que o ID será enviado se existir
      };

      const data = await pedidoService.criarPedido(
        payload, 
        itens, 
        total - valorDesconto + valorFrete, 
        valorFrete, 
        cupomAplicado?.codigo
      );
      if (data && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("URL de checkout indisponível");
      }
    } catch (error: any) {
      setSubmitError('Pagamento temporariamente indisponível. Tente novamente em instantes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-24 pb-20">
        <p className="font-black uppercase tracking-widest text-gray-500 animate-pulse">Carregando Checkout...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/checkout" replace />;
  }

  // Proteção extra visual
  if (itens.length === 0) {
    return null; // Será redirecionado pelo useEffect logo em seguida
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-24 md:pt-28 pb-20 container mx-auto px-4 max-w-6xl">
        
        {/* Cabeçalho */}
        <div className="border-b border-gray-200 pb-6 mb-8 flex justify-between items-end">
          <div>
            <button
              onClick={() => step === 'payment' ? setStep('details') : navigate('/carrinho')}
              className="flex items-center gap-2 mb-4 text-sm text-gray-500 hover:text-black transition-colors font-medium"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Finalizar Compra
            </h1>
          </div>
          
          {/* Breadcrumb visual */}
          <div className="hidden sm:flex items-center gap-4 text-sm font-bold uppercase tracking-widest">
            <span className={step === 'details' ? 'text-black' : 'text-gray-400'}>1. Entrega</span>
            <span className="text-gray-300">/</span>
            <span className={step === 'payment' ? 'text-black' : 'text-gray-400'}>2. Pagamento</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* ── Main Content ── */}
          <div className="flex-1 w-full space-y-8">
            {step === 'details' && (
              <div className="space-y-8">
                
                {/* Informações Pessoais */}
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg border-b border-gray-200 pb-2 mb-6">Informações Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Nome Completo</label>
                      <input name="nome" value={formData.nome} onChange={handleChange} type="text" className={`w-full bg-white border px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors ${errors.nome ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.nome && <p className="text-red-500 text-xs font-bold mt-1">{errors.nome}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">E-mail</label>
                      <input name="email" value={formData.email} onChange={handleChange} type="email" className={`w-full bg-white border px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.email && <p className="text-red-500 text-xs font-bold mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">CPF</label>
                      <input name="cpf" value={formData.cpf} onChange={handleChange} type="text" className={`w-full bg-white border px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors ${errors.cpf ? 'border-red-500' : 'border-gray-300'}`} placeholder="Apenas números" />
                      {errors.cpf && <p className="text-red-500 text-xs font-bold mt-1">{errors.cpf}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Telefone</label>
                      <input name="telefone" value={formData.telefone} onChange={handleChange} type="text" className={`w-full bg-white border px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors ${errors.telefone ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.telefone && <p className="text-red-500 text-xs font-bold mt-1">{errors.telefone}</p>}
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg border-b border-gray-200 pb-2 mb-6 pt-4">Endereço de Entrega</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">CEP</label>
                      <input name="cep" value={formData.cep} onChange={handleChange} type="text" className={`w-full bg-white border px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors ${errors.cep ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.cep && <p className="text-red-500 text-xs font-bold mt-1">{errors.cep}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Rua / Avenida</label>
                      <input name="rua" value={formData.rua} onChange={handleChange} type="text" className={`w-full bg-white border px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors ${errors.rua ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.rua && <p className="text-red-500 text-xs font-bold mt-1">{errors.rua}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Número</label>
                      <input name="numero" value={formData.numero} onChange={handleChange} type="text" className={`w-full bg-white border px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors ${errors.numero ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.numero && <p className="text-red-500 text-xs font-bold mt-1">{errors.numero}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Complemento (Opcional)</label>
                      <input name="complemento" value={formData.complemento} onChange={handleChange} type="text" className="w-full bg-white border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" placeholder="Apto, Bloco, etc" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Bairro</label>
                      <input name="bairro" value={formData.bairro} onChange={handleChange} type="text" className={`w-full bg-white border px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors ${errors.bairro ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.bairro && <p className="text-red-500 text-xs font-bold mt-1">{errors.bairro}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Cidade</label>
                      <input name="cidade" value={formData.cidade} onChange={handleChange} type="text" className={`w-full bg-white border px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors ${errors.cidade ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.cidade && <p className="text-red-500 text-xs font-bold mt-1">{errors.cidade}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Estado</label>
                      <input name="estado" value={formData.estado} onChange={handleChange} type="text" className={`w-full bg-white border px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors ${errors.estado ? 'border-red-500' : 'border-gray-300'}`} placeholder="UF" />
                      {errors.estado && <p className="text-red-500 text-xs font-bold mt-1">{errors.estado}</p>}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleContinue}
                  className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors mt-8"
                >
                  Continuar para Pagamento
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg border-b border-gray-200 pb-2 mb-6">Pagamento</h3>
                  <div className="bg-[#f5f5f5] p-8 border border-gray-200 text-center">
                    <img src="https://logospng.org/download/mercado-pago/logo-mercado-pago-icone-1024.png" alt="Mercado Pago" className="h-10 mx-auto mb-4 object-contain opacity-80" />
                    <h4 className="font-black uppercase tracking-tight text-base mb-2">Ambiente Seguro</h4>
                    <p className="text-sm text-gray-500">
                      Você será redirecionado para o Mercado Pago para concluir o pagamento via PIX, Cartão ou Boleto.
                    </p>
                  </div>
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-4 flex items-center gap-3">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <p className="font-bold text-sm">{submitError}</p>
                  </div>
                )}

                <button 
                  onClick={handlePayment}
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processando...' : 'Finalizar no Mercado Pago'} 
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>
              </div>
            )}
          </div>

          {/* ── Sidebar Resumo ── */}
          <div className="w-full lg:w-96 lg:sticky lg:top-24">
            <div className="bg-[#f5f5f5] p-6 border border-gray-200">
              <h3 className="font-black uppercase tracking-tight text-sm mb-4 pb-4 border-b border-gray-200">Resumo do Pedido</h3>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-6 pb-4 border-b border-gray-200">
                {itens.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-white flex-shrink-0 border border-gray-200">
                      <img 
                        src={item.imagem} 
                        alt={item.nome} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-produto.jpg'; }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="font-bold uppercase text-[11px] tracking-tight leading-tight mb-1">{item.nome}</p>
                      <p className="text-[10px] text-gray-500 mb-1">Tam: <span className="font-bold text-black">{item.tamanho}</span> | Qtd: <span className="font-bold text-black">{item.quantidade}</span></p>
                      <p className="font-black text-xs">R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cupom */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Cupom de Desconto</p>
                {cupomAplicado ? (
                  <div className="bg-green-50 border border-green-200 p-3 flex justify-between items-center">
                    <div>
                      <p className="font-black uppercase text-green-700 text-xs">{cupomAplicado.codigo}</p>
                      <p className="font-bold text-[10px] text-green-600">Cupom aplicado!</p>
                    </div>
                    <button onClick={handleRemoverCupom} className="text-red-500 font-bold text-[10px] uppercase hover:text-red-700 transition-colors">
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={cupomCodigoInput}
                      onChange={(e) => setCupomCodigoInput(e.target.value.toUpperCase())}
                      placeholder="INSERIR CÓDIGO"
                      className="bg-white border border-gray-300 px-3 py-2 text-xs font-bold uppercase flex-1 focus:outline-none focus:border-black transition-colors"
                    />
                    <button 
                      onClick={handleApplyCupom}
                      disabled={cupomLoading || !cupomCodigoInput.trim()}
                      className="bg-black text-white px-4 font-bold uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {cupomLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                )}
                {cupomError && <p className="text-red-500 text-[10px] font-bold mt-2">{cupomError}</p>}
              </div>

              {/* Totais */}
              <div className="space-y-2 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="uppercase text-[11px] font-bold tracking-widest">Subtotal</span>
                  <span className="text-black font-bold">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                {valorDesconto > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="uppercase text-[11px] font-bold tracking-widest">Desconto</span>
                    <span className="font-bold">- R$ {valorDesconto.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="uppercase text-[11px] font-bold tracking-widest">Frete</span>
                  <span className="text-black font-bold">
                    {valorFrete === 0 ? 'Calcular...' : `R$ ${valorFrete.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-black uppercase tracking-tight text-sm">Total Geral</span>
                <span className="font-black text-xl">
                  R$ {(total - valorDesconto + valorFrete).toFixed(2).replace('.', ',')}
                </span>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
