import { API_BASE_URL } from './api';

const API_URL = `${API_BASE_URL}/auth`;

export interface User {
  id: number;
  nome: string;
  email: string;
  is_admin: boolean;
  cpf?: string;
  telefone?: string;
}

export const authService = {
  login: async (email: string, senha: string): Promise<{ token: string; user: User }> => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao fazer login');
    return data;
  },

  register: async (nome: string, email: string, senha: string, telefone?: string, cpf?: string): Promise<{ token: string; user: User }> => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, telefone, cpf }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao registrar usuário');
    return data;
  },

  me: async (token: string): Promise<{ user: User }> => {
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Token inválido');
    return data;
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao solicitar recuperação.');
    return data;
  },

  resetPassword: async (token: string, novaSenha: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, novaSenha }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao redefinir a senha.');
    return data;
  },

  changePassword: async (token: string, senhaAntiga: string, novaSenha: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_URL}/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ senhaAntiga, novaSenha }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao alterar a senha.');
    return data;
  },
};
