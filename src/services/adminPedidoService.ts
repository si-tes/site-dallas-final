const API_URL = 'http://localhost:3000/pedidos/admin';

export interface PedidoAdminItem {
  id: number;
  camisa_id: number;
  tamanho_id: number;
  quantidade: number;
  preco_unitario: string;
  camisa_nome: string;
  tamanho_nome: string;
}

export interface PedidoAdmin {
  id: number;
  usuario_id: number | null;
  total: string;
  valor_frete: string;
  endereco_cep: string;
  endereco_rua: string;
  endereco_numero: string;
  endereco_complemento: string | null;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  status: string;
  payment_status: string;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  created_at: string;
  nome_cliente: string;
  email_cliente: string;
  telefone_cliente: string;
  cpf_cliente: string;
  itens?: PedidoAdminItem[];
}

export const adminPedidoService = {
  async listarPedidos(token: string, status?: string, dataInicio?: string, dataFim?: string): Promise<PedidoAdmin[]> {
    let url = API_URL + '?1=1';
    if (status && status !== 'Todos') url += `&status=${status}`;
    if (dataInicio) url += `&dataInicio=${dataInicio}`;
    if (dataFim) url += `&dataFim=${dataFim}`;

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Erro ao buscar pedidos');
    return res.json();
  },

  async obterDetalhes(token: string, id: number): Promise<PedidoAdmin> {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Erro ao buscar detalhes do pedido');
    return res.json();
  },

  async atualizarStatus(token: string, id: number, status: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Erro ao atualizar status');
  }
};
