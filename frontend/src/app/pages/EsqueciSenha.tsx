import { useState } from 'react';
import { Link } from 'react-router';
import { authService } from '../../services/authService';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const data = await authService.forgotPassword(email);
      setSuccessMsg(data.message || 'Se esse email existir, enviaremos instruções para redefinir sua senha.');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-black uppercase tracking-tighter text-black">
          Esqueci a Senha
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Digite seu e-mail para recuperar sua conta
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
            
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 text-sm font-bold text-center">
                {successMsg}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-gray-500">
                E-mail da Conta
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center bg-black text-white py-4 px-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors focus:outline-none disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Recuperar Senha'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-300 pt-6 text-center text-sm font-medium text-gray-500">
            Lembrou da senha?{' '}
            <Link to="/login" className="text-black hover:underline font-bold">
              Voltar para o Login
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}
