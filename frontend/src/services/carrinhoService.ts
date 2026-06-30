export interface ItemCarrinho {
  id: string;
  produtoId: string;
  nome: string;
  preco: number;
  imagem: string;
  tamanho: string;
  tamanhoId: number;
  quantidade: number;
  tipo_venda?: string;
  estoqueLocal?: boolean;
}

const STORAGE_KEY = '@DallasImports:carrinho';

export const carrinhoService = {
  getCarrinho: (): ItemCarrinho[] => {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  },

  salvarCarrinho: (itens: ItemCarrinho[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
  },

  adicionarAoCarrinho: (item: Omit<ItemCarrinho, 'id'>) => {
    const carrinho = carrinhoService.getCarrinho();
    const itemId = `${item.produtoId}_${item.tamanho}`;
    const itemExistenteIndex = carrinho.findIndex(i => i.id === itemId);

    if (itemExistenteIndex >= 0) {
      carrinho[itemExistenteIndex].quantidade += item.quantidade;
    } else {
      carrinho.push({ ...item, id: itemId });
    }

    carrinhoService.salvarCarrinho(carrinho);
  },

  removerDoCarrinho: (id: string) => {
    const carrinho = carrinhoService.getCarrinho();
    const novoCarrinho = carrinho.filter(i => i.id !== id);
    carrinhoService.salvarCarrinho(novoCarrinho);
  },

  atualizarQuantidade: (id: string, quantidade: number) => {
    const carrinho = carrinhoService.getCarrinho();
    const itemExistenteIndex = carrinho.findIndex(i => i.id === id);

    if (itemExistenteIndex >= 0) {
      if (quantidade <= 0) {
        carrinhoService.removerDoCarrinho(id);
        return;
      }
      carrinho[itemExistenteIndex].quantidade = quantidade;
      carrinhoService.salvarCarrinho(carrinho);
    }
  },

  getTotalItens: (): number => {
    const carrinho = carrinhoService.getCarrinho();
    return carrinho.reduce((total, item) => total + item.quantidade, 0);
  }
};
