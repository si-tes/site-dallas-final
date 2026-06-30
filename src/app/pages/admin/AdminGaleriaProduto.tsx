import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminGaleriaProduto({ produtoId, imagemPrincipalAtual, onPrincipalChange }: { produtoId: number, imagemPrincipalAtual: string, onPrincipalChange: () => void }) {
  const { token } = useAuth();
  const [imagens, setImagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const fetchImagens = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/produtos/${produtoId}/imagens`);
      const data = await res.json();
      setImagens(data.imagens || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImagens();
  }, [produtoId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('imagens', files[i]);
    }

    setUploading(true);
    setError('');
    
    try {
      const res = await fetch(`http://localhost:3000/produtos/${produtoId}/imagens`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        fetchImagens();
        if (e.target) e.target.value = '';
      } else {
        setError(data.error || 'Erro no upload.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro de conexão ao fazer upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imagemId: number) => {
    if (!window.confirm('Certeza que deseja remover esta imagem?')) return;
    try {
      const res = await fetch(`http://localhost:3000/produtos/${produtoId}/imagens/${imagemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchImagens();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetPrincipal = async (imagemId: number) => {
    try {
      const res = await fetch(`http://localhost:3000/produtos/${produtoId}/imagem-principal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ imagemId })
      });
      if (res.ok) {
        onPrincipalChange(); // Recarregar a lista mãe se necessário
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-xl border border-black/5">
      <h4 className="font-black uppercase italic mb-4">Galeria de Imagens</h4>
      
      {error && <div className="mb-4 text-red-600 font-bold text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

      <div className="mb-6">
        <label className="block bg-black text-white px-4 py-2 rounded-lg font-bold text-sm cursor-pointer w-max hover:bg-black/80 transition-colors">
          {uploading ? 'Enviando...' : 'Adicionar Imagens (JPEG/PNG/WEBP até 5MB)'}
          <input type="file" multiple accept="image/jpeg, image/png, image/webp" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="text-sm font-bold text-black/50">Carregando galeria...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {imagens.map((img) => {
            const isPrincipal = imagemPrincipalAtual === img.url_imagem;
            return (
              <div key={img.id} className={`relative border-2 rounded-lg overflow-hidden flex flex-col bg-gray-50 ${isPrincipal ? 'border-red-600' : 'border-transparent'}`}>
                <div className="relative">
                  <img src={`http://localhost:3000${img.url_imagem}`} alt="Galeria" className="w-full h-32 object-cover" />
                  {isPrincipal && (
                    <div className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">PRINCIPAL</div>
                  )}
                </div>
                <div className="flex justify-between items-center p-2 bg-white border-t border-black/5 gap-2">
                  {!isPrincipal ? (
                    <button onClick={() => handleSetPrincipal(img.id)} className="flex-1 bg-black text-white px-2 py-1.5 text-[10px] font-black uppercase rounded hover:bg-black/80 transition-colors">
                      Estrela
                    </button>
                  ) : (
                    <div className="flex-1"></div>
                  )}
                  <button onClick={() => handleDelete(img.id)} className="bg-red-600 text-white px-2 py-1.5 text-[10px] font-black uppercase rounded hover:bg-red-800 transition-colors">
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
          {imagens.length === 0 && <div className="text-sm font-bold text-black/50 col-span-full">Nenhuma imagem extra cadastrada.</div>}
        </div>
      )}
    </div>
  );
}
