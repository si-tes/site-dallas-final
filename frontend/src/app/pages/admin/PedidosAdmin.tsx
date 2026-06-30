import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { adminPedidoService, PedidoAdmin } from '../../../services/adminPedidoService';

const STATUS_OPCOES = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'em_separacao', label: 'Em Separação' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
];

export default function PedidosAdmin() {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoAdmin | null>(null);
  const [detalhesLoading, setDetalhesLoading] = useState(false);
  const [salvandoStatus, setSalvandoStatus] = useState(false);

  const carregarPedidos = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await adminPedidoService.listarPedidos(token, statusFilter, dataInicio, dataFim);
      setPedidos(data);
    } catch (err) {
      console.error(err);
      alert('Erro ao buscar pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, [token, statusFilter, dataInicio, dataFim]);

  const handleAbrirDetalhes = async (id: number) => {
    if (!token) return;
    try {
      setDetalhesLoading(true);
      const data = await adminPedidoService.obterDetalhes(token, id);
      setPedidoSelecionado(data);
    } catch (err) {
      console.error(err);
      alert('Erro ao abrir detalhes.');
    } finally {
      setDetalhesLoading(false);
    }
  };

  const handleStatusChange = async (novoStatus: string) => {
    if (!token || !pedidoSelecionado) return;
    try {
      setSalvandoStatus(true);
      await adminPedidoService.atualizarStatus(token, pedidoSelecionado.id, novoStatus);
      // Atualiza o state local do modal
      setPedidoSelecionado({ ...pedidoSelecionado, status: novoStatus });
      // Atualiza a lista por trás
      carregarPedidos();
      alert('Status atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar status.');
    } finally {
      setSalvandoStatus(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Pedidos</h2>
          <p className="text-sm font-bold text-black/50">Gerencie e atualize o status de entregas.</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <input 
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="border-2 border-black/10 rounded-lg p-2 font-bold text-sm focus:outline-none focus:border-red-600 bg-white"
            title="Data Inicial"
          />
          <span className="font-bold text-black/20">-</span>
          <input 
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border-2 border-black/10 rounded-lg p-2 font-bold text-sm focus:outline-none focus:border-red-600 bg-white"
            title="Data Final"
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-2 border-black/10 rounded-lg p-2 font-bold text-sm focus:outline-none focus:border-red-600 bg-white"
          >
            <option value="Todos">Todos os Status</option>
            {STATUS_OPCOES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 font-bold text-black/40">Carregando pedidos...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-b border-black/5 uppercase font-black text-xs text-black/50">
              <tr>
                <th className="p-4">Pedido</th>
                <th className="p-4">Data</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Total</th>
                <th className="p-4">Logística</th>
                <th className="p-4">Financeiro</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(pedido => (
                <tr key={pedido.id} className="border-b border-black/5 hover:bg-red-50/30 transition-colors">
                  <td className="p-4 font-bold">#{String(pedido.id).padStart(4, '0')}</td>
                  <td className="p-4 text-black/70">{new Date(pedido.created_at).toLocaleString('pt-BR')}</td>
                  <td className="p-4">
                    <div className="font-bold">{pedido.nome_cliente}</div>
                    <div className="text-xs text-black/40">{pedido.email_cliente}</div>
                  </td>
                  <td className="p-4 font-black italic">R$ {Number(pedido.total).toFixed(2).replace('.', ',')}</td>
                  <td className="p-4">
                    <span className="bg-black/10 text-black px-2 py-1 rounded text-[10px] font-black uppercase">
                      {STATUS_OPCOES.find(o => o.value === pedido.status)?.label || pedido.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                      pedido.payment_status === 'pago' ? 'bg-green-100 text-green-800' :
                      pedido.payment_status === 'aguardando_pagamento' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {pedido.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleAbrirDetalhes(pedido.id)}
                      className="bg-red-600 text-white font-bold px-3 py-1.5 rounded hover:bg-red-800 transition-colors text-xs uppercase"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {pedidos.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-black/40 font-bold">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE DETALHES */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="p-6 border-b border-black/5 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-black uppercase italic">
                Pedido #{String(pedidoSelecionado.id).padStart(4, '0')}
              </h3>
              <button onClick={() => setPedidoSelecionado(null)} className="text-black/40 hover:text-red-600 font-bold">
                FECHAR ✕
              </button>
            </div>

            {detalhesLoading ? (
              <div className="p-10 text-center font-bold text-black/40">Carregando detalhes do pedido...</div>
            ) : (
              <div className="p-6 space-y-8">
                
                {/* ÁREA DE STATUS LOGISTICO E FINANCEIRO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Logístico */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-black/5 flex flex-col justify-between items-start gap-4">
                    <div>
                      <p className="text-xs font-black uppercase text-black/40 mb-1">Status Logístico</p>
                      <p className="font-bold text-lg">{STATUS_OPCOES.find(o => o.value === pedidoSelecionado.status)?.label || pedidoSelecionado.status}</p>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <select 
                        disabled={salvandoStatus}
                        value={pedidoSelecionado.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="border-2 border-black/20 rounded-lg p-2 font-bold focus:outline-none focus:border-red-600 bg-white flex-1"
                      >
                        {STATUS_OPCOES.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {salvandoStatus && <span className="text-xs font-bold text-black/40 animate-pulse">Salvando...</span>}
                    </div>
                  </div>

                  {/* Status Financeiro */}
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col justify-between items-start gap-4">
                    <div className="w-full">
                      <p className="text-xs font-black uppercase text-blue-400 mb-1">Status Financeiro (Mercado Pago)</p>
                      <div className="flex justify-between items-center w-full">
                        <p className={`font-bold text-lg ${
                          pedidoSelecionado.payment_status === 'pago' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {pedidoSelecionado.payment_status.toUpperCase()}
                        </p>
                        <img src="https://logospng.org/download/mercado-pago/logo-mercado-pago-icone-1024.png" alt="MP" className="h-6" />
                      </div>
                    </div>
                    <div className="text-xs font-bold text-blue-800 space-y-1">
                      <p>Pref ID: {pedidoSelecionado.mp_preference_id || 'N/A'}</p>
                      <p>Pay ID: {pedidoSelecionado.mp_payment_id || 'Aguardando Pagamento'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* INFORMAÇÕES DO CLIENTE */}
                  <div>
                    <h4 className="font-black uppercase text-sm mb-4 border-b border-black/10 pb-2">Cliente</h4>
                    <p className="text-sm"><span className="font-bold">Nome:</span> {pedidoSelecionado.nome_cliente}</p>
                    <p className="text-sm"><span className="font-bold">Email:</span> {pedidoSelecionado.email_cliente}</p>
                    <p className="text-sm"><span className="font-bold">CPF:</span> {pedidoSelecionado.cpf_cliente}</p>
                    <p className="text-sm"><span className="font-bold">Telefone:</span> {pedidoSelecionado.telefone_cliente}</p>
                  </div>

                  {/* ENDEREÇO */}
                  <div>
                    <h4 className="font-black uppercase text-sm mb-4 border-b border-black/10 pb-2">Entrega</h4>
                    <p className="text-sm"><span className="font-bold">CEP:</span> {pedidoSelecionado.endereco_cep}</p>
                    <p className="text-sm"><span className="font-bold">Rua:</span> {pedidoSelecionado.endereco_rua}, {pedidoSelecionado.endereco_numero}</p>
                    {pedidoSelecionado.endereco_complemento && (
                      <p className="text-sm"><span className="font-bold">Comp:</span> {pedidoSelecionado.endereco_complemento}</p>
                    )}
                    <p className="text-sm"><span className="font-bold">Bairro:</span> {pedidoSelecionado.endereco_bairro}</p>
                    <p className="text-sm"><span className="font-bold">Cidade/UF:</span> {pedidoSelecionado.endereco_cidade} - {pedidoSelecionado.endereco_estado}</p>
                  </div>
                </div>

                {/* PRODUTOS */}
                <div>
                  <h4 className="font-black uppercase text-sm mb-4 border-b border-black/10 pb-2">Produtos</h4>
                  <div className="space-y-3">
                    {pedidoSelecionado.itens?.map(item => {
                      const subtotalItem = Number(item.preco_unitario) * item.quantidade;
                      return (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-black/5">
                          <div>
                            <p className="font-bold">{item.camisa_nome}</p>
                            <p className="text-xs font-black uppercase text-black/40">Tamanho: {item.tamanho_nome} | Qtd: {item.quantidade} x R$ {Number(item.preco_unitario).toFixed(2).replace('.', ',')}</p>
                          </div>
                          <div className="font-black italic text-right">
                            Subtotal: R$ {subtotalItem.toFixed(2).replace('.', ',')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* TOTAIS */}
                <div className="border-t border-black/10 pt-4 text-right">
                  <p className="text-sm text-black/60 font-bold mb-1">
                    Subtotal dos Produtos: R$ {
                      (pedidoSelecionado.itens?.reduce((acc, item) => acc + (Number(item.preco_unitario) * item.quantidade), 0) || 0).toFixed(2).replace('.', ',')
                    }
                  </p>
                  <p className="text-sm text-black/60 font-bold mb-1">Frete: R$ {Number(pedidoSelecionado.valor_frete).toFixed(2).replace('.', ',')}</p>
                  <p className="text-xl font-black italic text-red-600">Total Final: R$ {Number(pedidoSelecionado.total).toFixed(2).replace('.', ',')}</p>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
