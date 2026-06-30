import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

export default function Cadastro() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    cpf: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await authService.register(
        formData.nome, 
        formData.email, 
        formData.senha, 
        formData.telefone || undefined, 
        formData.cpf || undefined
      );
      
      setSuccess(true);
      // Auto login
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center bg-white py-12 px-8 shadow-sm border border-gray-200">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-black mb-4">Bem-vindo!</h2>
          <p className="text-gray-500 font-medium mb-6">Conta criada com sucesso. Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-black uppercase tracking-tighter text-black">
          Criar Conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Junte-se a nós para realizar suas compras
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:px-10">
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500">Nome Completo *</label>
              <input
                name="nome" type="text" required value={formData.nome} onChange={handleChange}
                className="mt-1 w-full bg-white border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500">E-mail *</label>
              <input
                name="email" type="email" required value={formData.email} onChange={handleChange}
                className="mt-1 w-full bg-white border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500">Telefone (Opcional)</label>
                <input
                  name="telefone" type="text" value={formData.telefone} onChange={handleChange}
                  className="mt-1 w-full bg-white border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500">CPF (Opcional)</label>
                <input
                  name="cpf" type="text" value={formData.cpf} onChange={handleChange}
                  className="mt-1 w-full bg-white border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500">Senha *</label>
                <input
                  name="senha" type="password" required value={formData.senha} onChange={handleChange}
                  className="mt-1 w-full bg-white border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500">Confirmar Senha *</label>
                <input
                  name="confirmarSenha" type="password" required value={formData.confirmarSenha} onChange={handleChange}
                  className="mt-1 w-full bg-white border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center bg-black text-white py-4 px-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors focus:outline-none disabled:opacity-50 mt-4"
              >
                {loading ? 'Cadastrando...' : 'Criar Conta'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-300 pt-6 text-center text-sm font-medium text-gray-500">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-black hover:underline font-bold">
              Entrar aqui
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}
