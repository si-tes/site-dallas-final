export interface BackendProduto {
  id: number;
  nome: string;
  descricao: string | null;
  preco: string | number;
  tipo_venda: string;
  imagem: string | null;
  ativo?: boolean;
}

export interface BackendGaleria {
  id: number;
  url_imagem: string;
}

export interface VisualProduto {
  id: string;
  name: string;
  description: string;
  price: number;
  cat: string;
  team?: string;
  image: string;
  img2: string;
  gallery: string[];
}

const FALLBACK_DESCRIPTION = "Produto importado com padrão de fabricação premium. Tecido altamente respirável com tecnologia antisuor, costuras reforçadas e detalhes fiéis ao modelo profissional usado pelos atletas.";
const FALLBACK_IMAGE = "/placeholder-produto.jpg";

import { API_BASE_URL } from '../../services/api';

function getApiUrl(): string {
  return API_BASE_URL;
}

function getFullUrl(path: string | undefined | null): string {
  if (!path) return FALLBACK_IMAGE;
  if (path.startsWith('http')) return path;
  
  const baseUrl = getApiUrl();
  return `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function mapProdutoToVisual(dbProduto: BackendProduto, dbGaleria: BackendGaleria[] = []): VisualProduto {
  const nomeSeguro = dbProduto.nome || 'Produto Indisponível';
  const precoSeguro = typeof dbProduto.preco === 'string' ? parseFloat(dbProduto.preco) : Number(dbProduto.preco || 0);

  // TODO: Futuramente, a categoria deve vir do banco de dados (relacionamento de tags ou categorias) em vez de hardcoded string match
  const nomeLower = nomeSeguro.toLowerCase();
  let categoriaVisual = 'Torcedor';
  if (nomeLower.includes('retrô') || nomeLower.includes('retro')) {
    categoriaVisual = 'Retrô';
  } else if (nomeLower.includes('player') || nomeLower.includes('performance') || dbProduto.tipo_venda === 'performance') {
    categoriaVisual = 'Performance';
  }

  // O campo team foi desativado temporariamente pois a heurística estava gerando falsos positivos (Ex: "Camisa" virava team)
  const teamVisual = undefined;

  // Montar URLs das imagens
  const imagemPrincipal = getFullUrl(dbProduto.imagem);
  const urlsGaleria = dbGaleria.map(img => getFullUrl(img.url_imagem));
  const galeriaUnica = Array.from(new Set([imagemPrincipal, ...urlsGaleria]));

  // Hover image seguro (img2)
  const imagemSecundaria = galeriaUnica.length > 1 ? galeriaUnica[1] : imagemPrincipal;

  return {
    id: String(dbProduto.id),
    name: nomeSeguro,
    description: dbProduto.descricao || FALLBACK_DESCRIPTION,
    price: precoSeguro,
    cat: categoriaVisual,
    team: teamVisual,
    image: imagemPrincipal,
    img2: imagemSecundaria,
    gallery: galeriaUnica,
  };
}
