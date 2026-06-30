import { useState, useEffect } from 'react';
import { Plus, Edit2, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE_URL } from '../../../services/api';

interface Cupom {
  id: number;
  codigo: string;
  tipo_desconto: 'percentual' | 'fixo';
  valor: number;
  ativo: boolean;
  data_validade: string | null;
  created_at?: string;
}

export default function CuponsAdmin() {
  const { token } = useAuth();
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCupom, setEditingCupom] = useState<Cupom | null>(null);

  const [formData, setFormData] = useState({
    codigo: '',
    tipo_desconto: 'percentual',
    valor: '',
    ativo: true,
    data_validade: ''
  });

  const loadCupons = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cupons`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Falha ao carregar');
      const data = await response.json();
      setCupons(data);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        valor: Number(formData.valor),
        data_validade: formData.data_validade || null
      };

      if (editingCupom) {
        await fetch(`${API_BASE_URL}/cupons/${editingCupom.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`${API_BASE_URL}/cupons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }
      
      setIsModalOpen(false);
      loadCupons();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      alert('Erro ao salvar cupom. Verifique os dados e tente novamente.');
    }
  };

  const openEdit = (cupom: Cupom) => {
    setEditingCupom(cupom);
    setFormData({
      codigo: cupom.codigo,
      tipo_desconto: cupom.tipo_desconto,
      valor: cupom.valor.toString(),
      ativo: cupom.ativo,
      data_validade: cupom.data_validade ? new Date(cupom.data_validade).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingCupom(null);
    setFormData({
      codigo: '',
      tipo_desconto: 'percentual',
      valor: '',
      ativo: true,
      data_validade: ''
    });
  };

  const toggleAtivo = async (cupom: Cupom) => {
    try {
      await fetch(`${API_BASE_URL}/cupons/${cupom.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...cupom, ativo: !cupom.ativo })
      });
      loadCupons();
    } catch (error) {
      console.error('Erro ao alternar status do cupom:', error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Gerenciar Cupons</h1>
          <p className="text-black/60 font-medium">Crie e edite cupons de desconto.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Novo Cupom
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 border-b border-black/5">
                <th className="p-4 font-bold text-xs uppercase tracking-widest text-black/60">Código</th>
                <th className="p-4 font-bold text-xs uppercase tracking-widest text-black/60">Tipo</th>
                <th className="p-4 font-bold text-xs uppercase tracking-widest text-black/60">Valor</th>
                <th className="p-4 font-bold text-xs uppercase tracking-widest text-black/60">Validade</th>
                <th className="p-4 font-bold text-xs uppercase tracking-widest text-black/60">Status</th>
                <th className="p-4 font-bold text-xs uppercase tracking-widest text-black/60 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {cupons.map((cupom) => (
                <tr key={cupom.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                  <td className="p-4 font-black text-lg">{cupom.codigo}</td>
                  <td className="p-4 font-bold text-sm uppercase">{cupom.tipo_desconto}</td>
                  <td className="p-4 font-bold text-red-600">
                    {cupom.tipo_desconto === 'percentual' ? `${cupom.valor}%` : `R$ ${Number(cupom.valor).toFixed(2).replace('.', ',')}`}
                  </td>
                  <td className="p-4 text-sm text-black/60">
                    {cupom.data_validade ? new Date(cupom.data_validade).toLocaleDateString('pt-BR') : 'Sem validade'}
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleAtivo(cupom)}>
                      {cupom.ativo ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(cupom)} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {cupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-black/60">Nenhum cupom cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-black/5 flex justify-between items-center bg-black/5">
              <h2 className="font-black italic uppercase tracking-tighter text-2xl">
                {editingCupom ? 'Editar Cupom' : 'Novo Cupom'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-black/60 hover:text-black">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Código do Cupom</label>
                <input 
                  type="text" 
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value.toUpperCase()})}
                  className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold uppercase"
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Tipo</label>
                  <select 
                    value={formData.tipo_desconto}
                    onChange={(e) => setFormData({...formData, tipo_desconto: e.target.value})}
                    className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold uppercase"
                  >
                    <option value="percentual">Percentual (%)</option>
                    <option value="fixo">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Valor</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Data de Validade (Opcional)</label>
                <input 
                  type="date" 
                  value={formData.data_validade}
                  onChange={(e) => setFormData({...formData, data_validade: e.target.value})}
                  className="w-full bg-[#f5f5f5] border-none rounded-xl px-4 py-3 font-bold text-black/60"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  className="w-5 h-5 rounded border-black/20 text-red-600 focus:ring-red-600"
                />
                <label htmlFor="ativo" className="font-bold cursor-pointer">Cupom Ativo</label>
              </div>

              <button 
                type="submit" 
                className="w-full bg-black text-white font-black italic uppercase tracking-widest py-4 rounded-xl hover:bg-red-600 transition-colors mt-4"
              >
                Salvar Cupom
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
