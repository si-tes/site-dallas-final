import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE_URL } from '../../../services/api';
import AdminGaleriaProduto from './AdminGaleriaProduto';
export default function ProdutosAdmin() {
  const { token } = useAuth();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const fetchProdutos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/produtos?all=true`);
      setProdutos(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleEdit = (prod: any) => {
    setEditingId(prod.id);
    setFormData({
      nome: prod.nome,
      descricao: prod.descricao || '',
      preco: prod.preco,
      tipo_venda: prod.tipo_venda,
      ativo: prod.ativo
    });
  };

  const handleSave = async () => {
    if (!token || !editingId) return;
    try {
      const isNew = editingId === -1;
      const url = isNew ? `${API_BASE_URL}/produtos` : `${API_BASE_URL}/produtos/${editingId}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage(isNew ? 'Produto criado!' : 'Produto atualizado!');
        setEditingId(null);
        fetchProdutos();
      } else {
        const err = await res.json();
        setMessage(err.erro || 'Erro ao salvar');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAtivo = async (id: number, atual: boolean) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/produtos/${id}`, {
        method: atual ? 'DELETE' : 'PUT', // DELETE inativa, PUT reativa
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: atual ? null : JSON.stringify({ ativo: true })
      });
      if (res.ok) {
        fetchProdutos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Carregando...</div>;

  const filteredProdutos = produtos.filter(prod => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = prod.nome.toLowerCase().includes(term) || String(prod.id) === term;
    if (!matchesSearch) return false;

    if (statusFilter === 'Ativos') return prod.ativo === true;
    if (statusFilter === 'Inativos') return prod.ativo === false;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Produtos</h2>
        <button 
          onClick={() => handleEdit({ id: -1, nome: '', descricao: '', preco: 170, tipo_venda: 'pronta_entrega', ativo: true })}
          className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm"
        >
          Novo Produto
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <input 
          type="text"
          placeholder="Buscar produto ou ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-xl border border-black/10 font-bold min-w-[250px]"
        />
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-black/10 font-bold"
        >
          <option value="Todos">Todos</option>
          <option value="Ativos">Ativos</option>
          <option value="Inativos">Inativos</option>
        </select>
      </div>

      {message && <div className="mb-4 p-3 bg-black/5 rounded-xl font-bold text-sm text-center">{message}</div>}

      {editingId && (
        <div className="mb-8 p-6 bg-[#f5f5f5] rounded-2xl">
          <h3 className="font-bold mb-4">{editingId === -1 ? 'Novo Produto' : 'Editar Produto'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-black uppercase block mb-1">Nome</label>
              <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full px-4 py-2 rounded-xl" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase block mb-1">Preço</label>
              <input type="number" value={formData.preco} onChange={e => setFormData({...formData, preco: Number(e.target.value)})} className="w-full px-4 py-2 rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase block mb-1">Descrição</label>
              <textarea value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full px-4 py-2 rounded-xl"></textarea>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase block mb-1">Tipo de Venda</label>
              <select value={formData.tipo_venda} onChange={e => setFormData({...formData, tipo_venda: e.target.value})} className="w-full px-4 py-2 rounded-xl">
                <option value="pronta_entrega">Pronta Entrega</option>
                <option value="encomenda">Encomenda</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={handleSave} className="bg-black text-white px-6 py-2 rounded-full font-bold">Salvar Dados Básicos</button>
            <button onClick={() => setEditingId(null)} className="bg-transparent px-6 py-2 rounded-full font-bold">Fechar Edição</button>
          </div>
          
          {editingId !== -1 && (
            <AdminGaleriaProduto 
              produtoId={editingId} 
              imagemPrincipalAtual={produtos.find(p => p.id === editingId)?.imagem}
              onPrincipalChange={fetchProdutos} 
            />
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black/10">
              <th className="py-3 px-4 font-black uppercase text-xs">ID</th>
              <th className="py-3 px-4 font-black uppercase text-xs">Nome</th>
              <th className="py-3 px-4 font-black uppercase text-xs">Preço</th>
              <th className="py-3 px-4 font-black uppercase text-xs">Status</th>
              <th className="py-3 px-4 font-black uppercase text-xs">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProdutos.map(prod => (
              <tr key={prod.id} className={`border-b border-black/5 hover:bg-black/5 transition-colors ${!prod.ativo ? 'opacity-50' : ''}`}>
                <td className="py-3 px-4 font-bold text-sm">#{prod.id}</td>
                <td className="py-3 px-4 font-bold text-sm">{prod.nome}</td>
                <td className="py-3 px-4 font-bold text-sm text-red-600">R$ {Number(prod.preco).toFixed(2)}</td>
                <td className="py-3 px-4 font-bold text-sm">
                  {prod.ativo ? <span className="text-green-600">Ativo</span> : <span className="text-red-600">Inativo</span>}
                </td>
                <td className="py-3 px-4 flex gap-2">
                  <button onClick={() => handleEdit(prod)} className="px-3 py-1 bg-black text-white rounded-full text-xs font-bold">Editar</button>
                  <button onClick={() => handleToggleAtivo(prod.id, prod.ativo)} className={`px-3 py-1 rounded-full text-xs font-bold text-white ${prod.ativo ? 'bg-red-600' : 'bg-green-600'}`}>
                    {prod.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredProdutos.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-black/50 font-bold">Nenhum produto encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
