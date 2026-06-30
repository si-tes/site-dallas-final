import { API_BASE_URL } from './api';

const API_URL = `${API_BASE_URL}/users`;

export interface UserProfile {
  id: number;
  nome: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  endereco_cep: string | null;
  endereco_rua: string | null;
  endereco_numero: string | null;
  endereco_complemento: string | null;
  endereco_bairro: string | null;
  endereco_cidade: string | null;
  endereco_estado: string | null;
}

export const userService = {
  getProfile: async (token: string): Promise<UserProfile> => {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao buscar perfil');
    return data;
  },

  updateProfile: async (token: string, profileData: Partial<UserProfile>): Promise<{ message: string; user: UserProfile }> => {
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar perfil');
    return data;
  }
};
