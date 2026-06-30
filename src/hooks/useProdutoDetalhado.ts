import { useState, useEffect } from 'react';
import { obterProduto, listarEstoqueComTamanhos, Produto, EstoqueComTamanho } from '../services/produtoService';
import { listarTamanhos, Tamanho } from '../services/tamanhoService';

interface UseProdutoDetalhadoReturn {
  produto: Produto | null;
  tamanhos: Tamanho[];
  estoque: EstoqueComTamanho[];
  loading: boolean;
  erro: string | null;
  erroTamanhos: string | null;
}

export default function useProdutoDetalhado(id: string): UseProdutoDetalhadoReturn {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([]);
  const [estoque, setEstoque] = useState<EstoqueComTamanho[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [erroTamanhos, setErroTamanhos] = useState<string | null>(null);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setLoading(true);
        setErro(null);
        setErroTamanhos(null);

        const produtoId = Number(id);

console.log("ID recebido na URL:", id);
console.log("ID convertido:", produtoId);

if (!id || Number.isNaN(produtoId)) {
  setErro("ID do produto inválido.");
  setLoading(false);
  return;
}

// Buscar produto
const produtoData = await obterProduto(produtoId);
        setProduto(produtoData);

        // Buscar tamanhos e estoque em paralelo
        try {
          const [tamanhosData, estoqueData] = await Promise.all([
            listarTamanhos(),
            listarEstoqueComTamanhos(produtoId),
          ]);

          setTamanhos(tamanhosData);
          setEstoque(estoqueData);
        } catch (error) {
          const mensagem = error instanceof Error ? error.message : 'Erro ao buscar tamanhos';
          setErroTamanhos(mensagem);
          console.error(mensagem);
        }
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Erro ao buscar produto';
        setErro(mensagem);
        console.error(mensagem);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      buscarDados();
    }
  }, [id]);

  return {
    produto,
    tamanhos,
    estoque,
    loading,
    erro,
    erroTamanhos,
  };
}