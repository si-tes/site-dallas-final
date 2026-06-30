import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-2xl w-full max-w-md text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase italic mb-2">Token Inválido</h1>
          <p className="text-black/60 font-medium mb-6">O link de redefinição parece estar quebrado ou não possui um token.</p>
          <Link to="/login" className="bg-black text-white px-8 py-3 rounded-full font-bold inline-block hover:bg-red-600 transition-colors">Ir para Login</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novaSenha !== confirmarSenha) {
      setStatus('error');
      setMessage('As senhas não coincidem.');
      return;
    }

    if (novaSenha.length < 6) {
      setStatus('error');
      setMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setStatus('loading');
      const data = await authService.resetPassword(token, novaSenha);
      setMessage(data.message);
      setStatus('success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setMessage(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-black/5 shadow-2xl w-full max-w-md"
      >
        <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Nova Senha</h1>
        <p className="text-black/40 font-bold mb-8">Digite sua nova senha de acesso.</p>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="font-bold text-sm">{message}</p>
          </div>
        )}

        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl flex flex-col items-center gap-4 text-center">
            <CheckCircle2 size={48} className="text-green-500" />
            <p className="font-bold text-lg">{message}</p>
            <p className="text-sm font-medium opacity-80">Redirecionando para o login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Nova Senha</label>
              <input 
                type="password" 
                required
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
                placeholder="••••••••" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Confirmar Nova Senha</label>
              <input 
                type="password" 
                required
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className={`w-full mt-4 text-white py-4 rounded-full font-black text-lg uppercase italic tracking-wider shadow-xl transition-all ${status === 'loading' ? 'bg-black/50 cursor-not-allowed' : 'bg-red-600 hover:bg-black'}`}
            >
              {status === 'loading' ? 'Salvando...' : 'Redefinir Senha'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
