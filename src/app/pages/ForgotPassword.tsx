import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatus('loading');
      const data = await authService.forgotPassword(email);
      setMessage(data.message);
      setStatus('success');
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
        <Link to="/login" className="inline-flex items-center gap-2 text-black/40 hover:text-black font-bold text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Voltar
        </Link>
        
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Esqueci a Senha</h1>
        <p className="text-black/40 font-bold mb-8">Digite seu e-mail para receber um link de recuperação.</p>

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
            <p className="text-sm font-medium opacity-80">Por favor, verifique sua caixa de entrada e a pasta de spam.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">E-mail Cadastrado</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
                placeholder="seu@email.com" 
              />
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className={`w-full mt-4 text-white py-4 rounded-full font-black text-lg uppercase italic tracking-wider shadow-xl transition-all ${status === 'loading' ? 'bg-black/50 cursor-not-allowed' : 'bg-red-600 hover:bg-black'}`}
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar Link'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
