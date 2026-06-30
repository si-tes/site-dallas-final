import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Imagem {
  id: number;
  url_imagem: string;
}

interface GaleriaProdutoProps {
  produtoId: string;
  imagemPrincipal: string;
  nome: string;
}

export default function GaleriaProduto({ produtoId, imagemPrincipal, nome }: GaleriaProdutoProps) {
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [imagemAtiva, setImagemAtiva] = useState(imagemPrincipal);

  useEffect(() => {
    if (imagemPrincipal) {
      setImagemAtiva(imagemPrincipal);
    }
  }, [imagemPrincipal]);

  const getImageUrl = (url?: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1551479460-5e76c686816a?w=1000';
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

  // Gerar array unificado de URLs sem duplicatas, priorizando a imagem principal
  const galeriaUrls = Array.from(new Set([
    ...(imagemPrincipal ? [imagemPrincipal] : []),
    ...imagens.map(img => img.url_imagem)
  ]));

  useEffect(() => {
    // Busca as imagens extras
    const fetchImagens = async () => {
      try {
        const res = await fetch(`http://localhost:3000/produtos/${produtoId}/imagens`);
        if (res.ok) {
          const data = await res.json();
          setImagens(data.imagens || []);
        }
      } catch (err) {
        console.error('Erro ao buscar galeria', err);
      }
    };
    fetchImagens();
  }, [produtoId]);

  return (
    <div className="flex flex-col gap-4">
      {/* Imagem Principal */}
      <div className="aspect-[4/5] bg-[#f5f5f5] rounded-3xl overflow-hidden border border-black/5 shadow-2xl transition-all duration-300">
        <ImageWithFallback
          src={getImageUrl(imagemAtiva)}
          alt={nome}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>
      
      {/* Miniaturas */}
      {galeriaUrls.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
          {galeriaUrls.map((url, index) => (
            <button 
              key={index}
              onClick={() => setImagemAtiva(url)}
              className={`flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${imagemAtiva === url ? 'border-red-600 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:border-black/20'}`}
            >
              <ImageWithFallback
                src={getImageUrl(url)}
                alt={`${nome} - Detalhe ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
