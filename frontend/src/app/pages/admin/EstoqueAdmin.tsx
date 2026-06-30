import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE_URL } from '../../../services/api';

export default function EstoqueAdmin() {
  const { token } = useAuth();
  const [estoque, setEstoque] = useState<any[]>([]);
  const [camisas, setCamisas] = useState<any[]>([]);
  const [tamanhos, setTamanhos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Para novo registro de estoque
  const [novoEstoque, setNovoEstoque] = useState({ camisa_id: '', tamanho_id: '', quantidade: 0 });
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tamanhoFilter, setTamanhoFilter] = useState('Todos');
  const [showZero, setShowZero] = useState(false);

  // Quantidades sendo editadas (Map de id_estoque -> nova quantidade)
  const [editQuantities, setEditQuantities] = useState<Record<number, number>>({});

  const fetchData = async () => {
    try {
      const [resEst, resCam, resTam] = await Promise.all([
        fetch(`${API_BASE_URL}/estoque`),
        fetch(`${API_BASE_URL}/produtos?all=true`),
        fetch(`${API_BASE_URL}/tamanhos`)
      ]);
      setEstoque(await resEst.json());
      setCamisas(await resCam.json());
      setTamanhos(await resTam.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (id: number) => {
    if (!token) return;
    const novaQtd = editQuantities[id];
    if (novaQtd === undefined) return;

    try {
      const res = await fetch(`${API_BASE_URL}/estoque/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quantidade: Number(novaQtd) })
      });
      if (res.ok) {
        setMessage('Estoque atualizado!');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/estoque`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          camisa_id: Number(novoEstoque.camisa_id),
          tamanho_id: Number(novoEstoque.tamanho_id),
          quantidade: Number(novoEstoque.quantidade)
        })
      });
      if (res.ok) {
        setMessage('Estoque criado!');
        setNovoEstoque({ camisa_id: '', tamanho_id: '', quantidade: 0 });
        fetchData();
      } else {
        const err = await res.json();
        setMessage(err.erro || 'Erro ao criar');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Carregando...</div>;

  const filteredEstoque = estoque.filter(item => {
    const term = searchTerm.toLowerCase().trim();
    if (term && !item.camisa?.toLowerCase().includes(term)) return false;
    
    if (tamanhoFilter !== 'Todos' && item.tamanho !== tamanhoFilter) return false;
    
    if (showZero && item.quantidade > 0) return false;
    
    return true;
  });

  return (
    <div>
      <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6">Controle de Estoque</h2>
      {message && <div className="mb-4 p-3 bg-black/5 rounded-xl font-bold text-sm text-center">{message}</div>}

      <div className="mb-8 p-6 bg-[#f5f5f5] rounded-2xl">
        <h3 className="font-bold mb-4">Adicionar Novo Estoque (Camisa + Tamanho)</h3>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block mb-1">Produto</label>
            <select 
              required value={novoEstoque.camisa_id} onChange={e => setNovoEstoque({...novoEstoque, camisa_id: e.target.value})}
              className="px-4 py-2 rounded-xl border-none font-bold"
            >
              <option value="">Selecione...</option>
              {camisas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block mb-1">Tamanho</label>
            <select 
              required value={novoEstoque.tamanho_id} onChange={e => setNovoEstoque({...novoEstoque, tamanho_id: e.target.value})}
              className="px-4 py-2 rounded-xl border-none font-bold"
            >
              <option value="">Selecione...</option>
              {tamanhos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block mb-1">Qtd</label>
            <input 
              type="number" min="0" required value={novoEstoque.quantidade} onChange={e => setNovoEstoque({...novoEstoque, quantidade: Number(e.target.value)})}
              className="px-4 py-2 rounded-xl border-none font-bold w-24"
            />
          </div>
          <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold">Adicionar</button>
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input 
          type="text"
          placeholder="Buscar camisa..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-xl border border-black/10 font-bold min-w-[250px]"
        />
        <select 
          value={tamanhoFilter} 
          onChange={e => setTamanhoFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-black/10 font-bold"
        >
          <option value="Todos">Todos os Tamanhos</option>
          {tamanhos.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
        </select>
        <label className="flex items-center gap-2 font-bold text-sm cursor-pointer ml-auto bg-[#f5f5f5] px-4 py-2 rounded-xl">
          <input 
            type="checkbox" 
            checked={showZero} 
            onChange={e => setShowZero(e.target.checked)} 
            className="w-4 h-4 accent-red-600"
          />
          Mostrar apenas estoque zerado
        </label>
      </div>

      <div className="overflow-x-auto pb-4">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-black/10">
              <th className="py-3 px-4 font-black uppercase text-xs tracking-widest text-black/40">Produto</th>
              <th className="py-3 px-4 font-black uppercase text-xs tracking-widest text-black/40">Tamanho</th>
              <th className="py-3 px-4 font-black uppercase text-xs tracking-widest text-black/40 text-center">Qtd Atual</th>
              <th className="py-3 px-4 font-black uppercase text-xs tracking-widest text-black/40 text-center">Nova Qtd</th>
              <th className="py-3 px-4 font-black uppercase text-xs tracking-widest text-black/40 text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredEstoque.map(item => (
              <tr key={item.id} className="border-b border-black/5 hover:bg-black/5 transition-colors">
                <td className="py-3 px-4 font-bold text-sm">{item.camisa}</td>
                <td className="py-3 px-4 font-bold text-sm">{item.tamanho}</td>
                <td className="py-3 px-4 font-black text-sm text-center text-black/60">{item.quantidade}</td>
                <td className="py-3 px-4 text-center">
                  <input 
                    type="number" min="0"
                    placeholder="Qtd..."
                    value={editQuantities[item.id] ?? ''}
                    onChange={e => setEditQuantities({...editQuantities, [item.id]: Number(e.target.value)})}
                    className="w-20 px-3 py-2 rounded-lg border border-black/10 font-bold bg-white mx-auto text-center"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <button 
                    onClick={() => handleUpdate(item.id)}
                    disabled={editQuantities[item.id] === undefined}
                    className="bg-black text-white px-6 py-2 rounded-full text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
                  >
                    Salvar
                  </button>
                </td>
              </tr>
            ))}
            {filteredEstoque.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-black/50 font-bold">Nenhum registro de estoque encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
