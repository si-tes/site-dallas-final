import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { authService } from '../../services/authService';

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Token de recuperação não fornecido ou inválido.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword(token, senha);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center bg-white py-12 px-8 shadow-sm border border-gray-200">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-black mb-4">Sucesso!</h2>
          <p className="text-gray-500 font-medium mb-6">Sua senha foi redefinida. Você será redirecionado para o login.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-black uppercase tracking-tighter text-black">
          Redefinir Senha
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Crie uma nova senha segura para sua conta
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:px-10">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500">Nova Senha</label>
              <input
                type="password" required value={senha} onChange={e => setSenha(e.target.value)}
                className="mt-1 w-full bg-white border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="••••••••"
                disabled={!token || loading}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500">Confirmar Nova Senha</label>
              <input
                type="password" required value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
                className="mt-1 w-full bg-white border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="••••••••"
                disabled={!token || loading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={!token || loading}
                className="w-full flex justify-center bg-black text-white py-4 px-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors focus:outline-none disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Redefinir Senha'}
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  );
}
