import { fetchApi } from './api';

export interface Tamanho {
  id: number;
  nome: string;
  acrescimo_preco?: number;
}

async function listarTamanhos(): Promise<Tamanho[]> {
  return fetchApi<Tamanho[]>('/tamanhos');
}

export { listarTamanhos };
export default { listarTamanhos };