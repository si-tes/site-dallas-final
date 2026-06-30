fetch('http://localhost:3000/estoque?camisa_id=1').then(r => r.json()).then(console.log).catch(console.error);
fetch('http://localhost:3000/tamanhos').then(r => r.json()).then(console.log).catch(console.error);
