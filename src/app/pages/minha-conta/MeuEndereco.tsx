import { useState, useEffect } from 'react';
import { MapPin, Save, AlertCircle, Loader2 } from 'lucide-react';
import { userService, UserProfile } from '../../../services/userService';
import { useAuth } from '../../../contexts/AuthContext';

export default function MeuEndereco() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    if (token) {
      userService.getProfile(token).then(data => setProfile(data)).catch(err => console.error(err));
    }
  }, [token]);

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setProfile(prev => ({
          ...prev,
          endereco_rua: data.logradouro,
          endereco_bairro: data.bairro,
          endereco_cidade: data.localidade,
          endereco_estado: data.uf,
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoCep = e.target.value;
    setProfile({ ...profile, endereco_cep: novoCep });
    if (novoCep.replace(/\D/g, '').length === 8) {
      buscarCep(novoCep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setStatus('loading');
    try {
      const { endereco_cep, endereco_rua, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado } = profile;
      const res = await userService.updateProfile(token, { 
        endereco_cep, endereco_rua, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado 
      });
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
          <MapPin size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Meu Endereço</h2>
          <p className="text-black/40 font-bold text-sm">Este endereço será usado em suas compras</p>
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

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 relative">
            <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">CEP</label>
            <input 
              type="text" 
              value={profile.endereco_cep || ''}
              onChange={handleCepChange}
              placeholder="00000-000"
              className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
            />
            {buscandoCep && <Loader2 className="absolute right-4 top-10 animate-spin text-black/40" size={16} />}
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Rua / Logradouro</label>
            <input 
              type="text" 
              value={profile.endereco_rua || ''}
              onChange={e => setProfile({...profile, endereco_rua: e.target.value})}
              className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Número</label>
            <input 
              type="text" 
              value={profile.endereco_numero || ''}
              onChange={e => setProfile({...profile, endereco_numero: e.target.value})}
              className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Complemento (Opcional)</label>
            <input 
              type="text" 
              value={profile.endereco_complemento || ''}
              onChange={e => setProfile({...profile, endereco_complemento: e.target.value})}
              className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Bairro</label>
            <input 
              type="text" 
              value={profile.endereco_bairro || ''}
              onChange={e => setProfile({...profile, endereco_bairro: e.target.value})}
              className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Cidade</label>
            <input 
              type="text" 
              value={profile.endereco_cidade || ''}
              onChange={e => setProfile({...profile, endereco_cidade: e.target.value})}
              className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Estado (UF)</label>
            <input 
              type="text" 
              maxLength={2}
              value={profile.endereco_estado || ''}
              onChange={e => setProfile({...profile, endereco_estado: e.target.value.toUpperCase()})}
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
          {status === 'loading' ? 'Salvando...' : 'Salvar Endereço'}
        </button>
      </form>
    </div>
  );
}
