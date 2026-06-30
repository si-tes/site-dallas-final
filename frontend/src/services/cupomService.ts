import { API_BASE_URL } from './api';

export interface Cupom {
  id: number;
  codigo: string;
  tipo_desconto: 'percentual' | 'fixo';
  valor: number;
  ativo: boolean;
  data_validade: string | null;
}

const API_URL = `${API_BASE_URL}/cupons`;

export const cupomService = {
  validarCupom: async (codigo: string): Promise<Cupom> => {
    try {
      const response = await fetch(`${API_URL}/validar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Cupom inválido');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
};
