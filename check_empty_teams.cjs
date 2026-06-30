const fs = require('fs');

// 1. Load TEAMS from teste_1.html
const html = fs.readFileSync('./teste_1.html', 'utf8');
const match = html.match(/const TEAMS = (\{[\s\S]*?\});/);
if (!match) {
    console.log('TEAMS nao encontrado em teste_1.html');
    process.exit(1);
}
const TEAMS = eval('(' + match[1] + ')');

// 2. Load ALL_PRODUCTS from products.js
const productsJs = fs.readFileSync('./products.js', 'utf8');
const matchProd = productsJs.match(/window\.PRODUCTS = (\[[\s\S]*\]);/);
const ALL_PRODUCTS = matchProd ? eval('(' + matchProd[1] + ')') : [];

console.log(`Total TEAMS loaded: ${Object.values(TEAMS).flat().length}`);
console.log(`Total PRODUCTS loaded: ${ALL_PRODUCTS.length}`);

// 3. Find empty teams
const emptyTeams = [];
Object.keys(TEAMS).forEach(leagueId => {
    TEAMS[leagueId].forEach(team => {
        const hasProducts = ALL_PRODUCTS.some(p => p.teamId === team.id);
        if (!hasProducts) {
            emptyTeams.push({ league: leagueId, name: team.name, id: team.id });
        }
    });
});

console.log('\n--- TIMES SEM NENHUM PRODUTO ---');
emptyTeams.forEach(t => {
    console.log(`- [${t.league}] ${t.name} (ID: ${t.id})`);
});
console.log(`\nTotal de times sem camisa: ${emptyTeams.length}`);
