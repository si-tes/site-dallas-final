import { mapProdutoToVisual, BackendProduto, BackendGaleria } from './src/app/adapters/produtoMapper';

console.log("=== TESTE 1 e 4: Imagem, Galeria e Descrição null ===");
const p1: BackendProduto = { id: 1, nome: "Real Madrid Away", descricao: null, preco: "349.90", tipo_venda: "pronta_entrega", imagem: "/img1.jpg" };
const g1: BackendGaleria[] = [{ id: 10, url_imagem: "/img2.jpg" }];
console.log(JSON.stringify(mapProdutoToVisual(p1, g1), null, 2));

console.log("\n=== TESTE 2: Produto sem Galeria ===");
const p2: BackendProduto = { id: 2, nome: "Flamengo Home Player", descricao: "Leve.", preco: 350.00, tipo_venda: "performance", imagem: "/img1.jpg" };
console.log(JSON.stringify(mapProdutoToVisual(p2, []), null, 2));

console.log("\n=== TESTE 3: Produto sem Imagem ===");
const p3: BackendProduto = { id: 3, nome: "Juventus Retro", descricao: "Clássica.", preco: 299.99, tipo_venda: "encomenda", imagem: null };
console.log(JSON.stringify(mapProdutoToVisual(p3, []), null, 2));

console.log("\n=== TESTE 5: Nome começando com 'Camisa' (Validando exclusão do team) ===");
const p4: BackendProduto = { id: 4, nome: "Camisa Corinthians Retro 1990", descricao: "Manto sagrado.", preco: "299.90", tipo_venda: "pronta_entrega", imagem: "/timao.jpg" };
console.log(JSON.stringify(mapProdutoToVisual(p4, []), null, 2));

