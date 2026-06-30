const fs = require('fs');
const html = fs.readFileSync('./teste_1.html', 'utf8');
const match = html.match(/const TEAMS = (\{[\s\S]*?\});/);
if (!match) { console.log('TEAMS nao encontrado'); process.exit(1); }

const TEAMS = eval('(' + match[1] + ')');
const existingTeams = [];
Object.values(TEAMS).forEach(league => {
    league.forEach(team => existingTeams.push(team.name.toLowerCase()));
});

const userList = `
Portuguesa
Volta Redonda
Juventude
Cuiabá
Confiança
Coritiba
Criciúma
Santa Cruz
Chapecoense
Vitória
Paysandu
Remo
Guarani
Ceará
Avaí
América-MG
Fortaleza
Bahia
Flamengo
Fluminense
Vasco da Gama
Internacional
Botafogo
Grêmio
Corinthians
Cruzeiro
Atlético Mineiro
Palmeiras
Santos
São Paulo
Athletico Paranaense
Bragantino
Sport Recife
Náutico
Burnley
Middlesbrough
Birmingham City
Plymouth Argyle
Bradford City
Preston North End
Portsmouth
Wrexham
Lincoln City
Bolton Wanderers
Norwich City
Derby County
Ipswich Town
Sheffield Wednesday
Sunderland
Bournemouth
Southampton
Watford
Cardiff City
Fulham
Liverpool (Versões Torcedor, Jogador e Retrô)
Sheffield United
Nottingham Forest
Brighton & Hove Albion
Manchester United
Manchester City
Arsenal
Everton
Leicester City
Wolverhampton
Chelsea
Leeds United
Newcastle United
Tottenham Hotspur
Crystal Palace
Aston Villa
West Ham United
West Bromwich Albion
Cartagena
Levante
Burgos
Ceuta
Hércules
Murcia
Racing de Santander
Mallorca
Getafe
Sporting de Gijón
Almeria
Albacete
Cordoba
Zaragoza
Tenerife
Real Oviedo
Celta de Vigo
Deportivo La Coruna
Girona
Rayo Vallecano
Las Palmas
Leganés
Málaga CF
Espanyol
Barcelona
Real Madrid
Atlético de Madrid
Valencia
Sevilla
Real Betis
Alavés
Elche
Osasuna
Valladolid
Villarreal
Athletic Bilbao
Real Sociedad
Granada
Cádiz
Huesca
Cremonese
Sorrento Calcio
Palermo
Hellas Verona
Como 1907
Juventus (Versões Torcedor, Jogador e Retrô)
Brescia
Bologna
Genoa
Venezia
Milan
Inter de Milão
Roma
Napoli
Parma
Atalanta
Sampdoria
Sassuolo
Lazio
Fiorentina
Torino
Cagliari
Spezia
Augsburg
Magdeburg
Nürnberg
VfL Bochum
Holstein Kiel
Hansa Rostock
Carl Zeiss Jena
Arminia Bielefeld
Mainz 05
SC Freiburg
Fortuna Düsseldorf
Hamburger SV
Wolfsburg
Heidenheim
Bayer Leverkusen
Union Berlin
Schalke 04
Hertha Berlin
St. Pauli
Borussia Mönchengladbach
Werder Bremen
Hoffenheim
Bayern de Munique
Borussia Dortmund
Eintracht Frankfurt
RB Leipzig
Greuther Fürth
FC Köln
Stuttgart
Auxerre
Paris FC
Toulouse
Versailles
Rennes
PSG (Paris Saint-Germain)
Olympique de Marseille
Lille
Lyon
Angers
Lens
Monaco
Nantes
OGC Nice
Saint-Étienne
Strasbourg
Brest
Bordeaux
Celtic FC
PSV Eindhoven
Benfica
Sporting
FC Porto
Braga
Vitória de Guimarães
Ajax
Galatasaray
Fenerbahçe
Boca Juniors
River Plate
Argentinos Juniors
Racing Club
Lanús
Tigre
San Lorenzo
Newell's Old Boys
Club América (México)
Chivas Guadalajara (México)
Cruz Azul (México)
Monterrey (México)
Toluca (México)
Tigres UANL (México)
León (México)
Pumas UNAM (México)
Atlas (México)
Necaxa (México)
Universidad de Chile
Colo Colo (Chile)
Palestino (Chile)
América de Cali (Colômbia)
Atlético Nacional (Colômbia)
Peñarol (Uruguai)
Nacional (Uruguai)
Al-Nassr (Arábia Saudita)
Al-Hilal (Arábia Saudita)
Al-Ahli (Arábia Saudita)
Al-Ittihad (Arábia Saudita)
Rangers FC
Panathinaikos
Olympiacos
Estrela Vermelha
Zenit
FC Copenhagen
Hajduk Split
Real Salt Lake (EUA)
Nashville SC (EUA)
Japão
Holanda
França
Colômbia
Inglaterra
Suécia
Estados Unidos (USA)
Espanha
Portugal
Panamá
Nigéria
Brasil
México
Alemanha
Argentina
Itália
Turquia
Austrália
Chile
Marrocos
Venezuela
África do Sul
Peru
Paraguai
Grécia
Hungria
Costa Rica
Canadá
`.split('\n').map(t => t.trim()).filter(t => t);

const missing = [];
userList.forEach(t => {
    // Normalizações de nome
    let searchName = t.toLowerCase();
    searchName = searchName.replace(/ \(.*\)/g, ''); // remove (México), (Versões...), etc
    searchName = searchName.replace('psg', 'paris'); // Ajuste psg
    searchName = searchName.replace('atlético mineiro', 'atlético-mg');
    searchName = searchName.replace('athletico paranaense', 'athletico-pr');
    searchName = searchName.replace('inter de milão', 'internazionale');
    searchName = searchName.replace('bayern de munique', 'bayern');
    searchName = searchName.replace('bayer leverkusen', 'leverkusen');
    
    // Busca flexível
    const found = existingTeams.some(et => 
        et.includes(searchName) || searchName.includes(et) ||
        // Verifica se removendo espaços/acentos bate
        et.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g,'') === searchName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g,'')
    );
    if (!found) missing.push(t);
});

console.log('Missings:', missing);
console.log('Total checked:', userList.length);
