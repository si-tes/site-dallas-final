import { fetchApi } from './api';

export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  tipo_venda: string;
  imagem: string;
  ativo?: boolean;
  created_at?: string;
}

export interface EstoqueComTamanho {
  id: number;
  camisa: string;
  tamanho: string;
  quantidade: number;
  updated_at?: string;
}

async function listarProdutos(): Promise<Produto[]> {
  return fetchApi<Produto[]>('/produtos');
}

async function obterProduto(id: number): Promise<Produto> {
  return fetchApi<Produto>(`/produtos/${id}`);
}

async function listarEstoqueComTamanhos(camisa_id: number): Promise<EstoqueComTamanho[]> {
  return fetchApi<EstoqueComTamanho[]>(`/estoque?camisa_id=${camisa_id}`);
}

async function obterGaleriaProduto(id: number): Promise<{ id: number, url_imagem: string }[]> {
  try {
    const res = await fetchApi<{ imagens: { id: number, url_imagem: string }[] }>(`/produtos/${id}/imagens`);
    return res.imagens || [];
  } catch {
    return [];
  }
}

async function listarTamanhos(): Promise<{ id: number, nome: string, acrescimo_preco: string }[]> {
  try {
    return await fetchApi<{ id: number, nome: string, acrescimo_preco: string }[]>('/tamanhos');
  } catch {
    return [];
  }
}

export { listarProdutos, obterProduto, listarEstoqueComTamanhos, obterGaleriaProduto, listarTamanhos };
export default { listarProdutos, obterProduto, listarEstoqueComTamanhos, obterGaleriaProduto, listarTamanhos };