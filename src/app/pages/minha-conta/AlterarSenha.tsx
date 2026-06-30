import { useState } from 'react';
import { KeyRound, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../../../services/authService';
import { useAuth } from '../../../contexts/AuthContext';

export default function AlterarSenha() {
  const { token } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (novaSenha !== confirmarSenha) {
      setStatus('error');
      setMessage('As novas senhas não coincidem.');
      return;
    }

    if (novaSenha.length < 6) {
      setStatus('error');
      setMessage('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setStatus('loading');
    try {
      const res = await authService.changePassword(token, senhaAtual, novaSenha);
      setMessage(res.message);
      setStatus('success');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setMessage(err.message);
      setStatus('error');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-50 rounded-xl text-red-600">
          <KeyRound size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Alterar Senha</h2>
          <p className="text-black/40 font-bold text-sm">Atualize sua credencial de acesso</p>
        </div>
      </div>

      {status === 'success' && (
        <div className="bg-green-50 text-green-800 p-4 rounded-xl mb-6 font-bold text-sm flex gap-2 items-center">
          <CheckCircle2 size={20} /> {message}
        </div>
      )}
      {status === 'error' && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl mb-6 font-bold text-sm flex gap-2 items-center">
          <AlertCircle size={20} /> {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Senha Atual</label>
          <input 
            type="password" required
            value={senhaAtual}
            onChange={e => setSenhaAtual(e.target.value)}
            className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Nova Senha</label>
          <input 
            type="password" required
            value={novaSenha}
            onChange={e => setNovaSenha(e.target.value)}
            className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Confirmar Nova Senha</label>
          <input 
            type="password" required
            value={confirmarSenha}
            onChange={e => setConfirmarSenha(e.target.value)}
            className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full font-black uppercase italic tracking-widest hover:bg-black transition-colors"
        >
          <Save size={20} />
          {status === 'loading' ? 'Salvando...' : 'Atualizar Senha'}
        </button>
      </form>
    </div>
  );
}
