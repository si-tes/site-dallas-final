import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await authService.register(formData.nome, formData.email, formData.senha);
      login(data.token, data.user);
      
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-black/5 shadow-2xl w-full max-w-md"
      >
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Criar Conta</h1>
        <p className="text-black/40 font-bold mb-8">Junte-se a nós hoje mesmo.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Nome Completo</label>
            <input 
              type="text" 
              required
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
              className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
              placeholder="Seu nome" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">E-mail</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
              placeholder="seu@email.com" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase italic tracking-widest text-black/40">Senha</label>
            <input 
              type="password" 
              required
              value={formData.senha}
              onChange={e => setFormData({ ...formData, senha: e.target.value })}
              className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-red-600/20" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full mt-4 text-white py-4 rounded-full font-black text-lg uppercase italic tracking-wider shadow-xl transition-all ${loading ? 'bg-black/50 cursor-not-allowed' : 'bg-red-600 hover:bg-black'}`}
          >
            {loading ? 'Aguarde...' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-center font-bold text-black/40 mt-8 text-sm">
          Já tem conta? <Link to={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} className="text-red-600 hover:underline">Faça Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
