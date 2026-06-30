import { useState, useEffect } from 'react';
import { ShoppingBag, Package } from 'lucide-react';
import { pedidoService } from '../../../services/pedidoService';
import { useAuth } from '../../../contexts/AuthContext';

interface Pedido {
  id: number;
  total: string;
  valor_frete: string;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function PedidosList() {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      pedidoService.meusPedidos(token)
        .then(data => setPedidos(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-black/10 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-black/10 rounded"></div></div></div></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-50 rounded-xl text-red-600">
          <ShoppingBag size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Minhas Compras</h2>
          <p className="text-black/40 font-bold text-sm">Acompanhe seu histórico de pedidos</p>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-12 bg-[#f5f5f5] rounded-2xl border border-black/5">
          <Package size={48} className="mx-auto text-black/20 mb-4" />
          <h3 className="text-lg font-black uppercase italic mb-2">Nenhum pedido encontrado</h3>
          <p className="text-black/40 font-bold text-sm">Você ainda não realizou nenhuma compra.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map(pedido => (
            <div key={pedido.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-[#fafafa] rounded-2xl border border-black/5 hover:border-red-200 transition-colors gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-1">
                  Pedido #{String(pedido.id).padStart(4, '0')}
                </p>
                <p className="font-bold text-sm text-black">
                  Realizado em {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div className="flex gap-6 items-center w-full md:w-auto justify-between md:justify-end">
                <div className="text-left md:text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">Total</p>
                  <p className="font-black text-red-600 italic">R$ {Number(pedido.total).toFixed(2).replace('.', ',')}</p>
                </div>
                
                <div className="flex flex-col gap-2 items-end">
                  {/* Status Financeiro */}
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    pedido.payment_status === 'aguardando_pagamento' ? 'bg-orange-100 text-orange-800' :
                    pedido.payment_status === 'pago' ? 'bg-green-100 text-green-800' :
                    pedido.payment_status === 'recusado' ? 'bg-red-100 text-red-800' :
                    pedido.payment_status === 'cancelado' ? 'bg-gray-100 text-gray-800' :
                    pedido.payment_status === 'reembolsado' ? 'bg-blue-100 text-blue-800' :
                    'bg-black text-white'
                  }`}>
                    {pedido.payment_status === 'aguardando_pagamento' ? 'Aguardando Pagamento' :
                     pedido.payment_status === 'pago' ? 'Pagamento Aprovado' :
                     pedido.payment_status === 'recusado' ? 'Pagamento Recusado' :
                     pedido.payment_status === 'cancelado' ? 'Cancelado' :
                     pedido.payment_status === 'reembolsado' ? 'Reembolsado' :
                     pedido.payment_status}
                  </div>

                  {/* Status Logístico */}
                  {pedido.payment_status === 'pago' && (
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      pedido.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                      pedido.status === 'em_separacao' ? 'bg-purple-100 text-purple-800' :
                      pedido.status === 'enviado' ? 'bg-blue-100 text-blue-800' :
                      pedido.status === 'entregue' ? 'bg-green-100 text-green-800' :
                      pedido.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                      'bg-black text-white'
                    }`}>
                      {pedido.status === 'pendente' ? 'Aguardando Envio' :
                       pedido.status === 'em_separacao' ? 'Em Separação' :
                       pedido.status === 'enviado' ? 'Enviado' :
                       pedido.status === 'entregue' ? 'Entregue' :
                       pedido.status === 'cancelado' ? 'Cancelado' :
                       pedido.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
