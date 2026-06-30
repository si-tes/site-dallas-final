import { useState, useEffect } from 'react';
import { listarProdutos, Produto } from '../services/produtoService';

interface UseProdutosReturn {
  produtos: Produto[];
  loading: boolean;
  erro: string | null;
  refetch: () => Promise<void>;
}

export default function useProdutos(): UseProdutosReturn {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const buscarProdutos = async () => {
    try {
      setLoading(true);
      setErro(null);
      const dados = await listarProdutos();
      setProdutos(dados);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao buscar produtos';
      setErro(mensagem);
      console.error(mensagem);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarProdutos();
  }, []);

  return {
    produtos,
    loading,
    erro,
    refetch: buscarProdutos,
  };
}