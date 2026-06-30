import { useState, useEffect } from 'react';
import { UserCircle, Save, AlertCircle } from 'lucide-react';
import { userService, UserProfile } from '../../../services/userService';
import { useAuth } from '../../../contexts/AuthContext';

export default function MeusDados() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      userService.getProfile(token).then(data => setProfile(data)).catch(err => console.error(err));
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setStatus('loading');
    try {
      const { nome, cpf, telefone } = profile;
      const res = await userService.updateProfile(token, { nome, cpf, telefone });
      setMessage(res.message);
      setStatus('success');
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
          <UserCircle size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Meus Dados</h2>
          <p className="text-black/40 font-bold text-sm">Atualize suas informações pessoais</p>
        </div>
      </div>

      {status === 'success' && (
        <div className="bg-green-50 text-green-800 p-4 rounded-xl mb-6 font-bold text-sm">
          {message}
        </div>
      )}
      {status === 'error' && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl mb-6 font-bold text-sm flex gap-2 items-center">
          <AlertCircle size={20} /> {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Nome Completo</label>
          <input 
            type="text" required
            value={profile.nome || ''}
            onChange={e => setProfile({...profile, nome: e.target.value})}
            className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">E-mail (Não editável)</label>
          <input 
            type="email" disabled
            value={profile.email || ''}
            className="w-full bg-[#f5f5f5] text-black/40 border-none rounded-xl px-4 py-3 font-bold cursor-not-allowed" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">CPF</label>
            <input 
              type="text" 
              value={profile.cpf || ''}
              onChange={e => setProfile({...profile, cpf: e.target.value})}
              placeholder="000.000.000-00"
              className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Telefone</label>
            <input 
              type="text" 
              value={profile.telefone || ''}
              onChange={e => setProfile({...profile, telefone: e.target.value})}
              placeholder="(00) 00000-0000"
              className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full font-black uppercase italic tracking-widest hover:bg-black transition-colors"
        >
          <Save size={20} />
          {status === 'loading' ? 'Salvando...' : 'Salvar Dados'}
        </button>
      </form>
    </div>
  );
}
