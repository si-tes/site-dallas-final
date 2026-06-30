import { ItemCarrinho } from './carrinhoService';
import { API_BASE_URL } from './api';

const API_URL = `${API_BASE_URL}/pedidos`;

export interface DadosCliente {
  usuario_id?: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
}

export const pedidoService = {
  criarPedido: async (dadosCliente: DadosCliente, itens: ItemCarrinho[], total: number, frete: number, codigo_cupom?: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dadosCliente,
          itens,
          total,
          frete,
          codigo_cupom
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Erro ao criar pedido');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro no pedidoService:', error);
      throw error;
    }
  },

  meusPedidos: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/meus-pedidos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro no pedidoService.meusPedidos:', error);
      throw error;
    }
  }
};
