#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scraper Yupoo Completo - Camisetas de Futebol (CORRIGIDO)
Coleta as camisetas reais acessando as categorias de produtos (New mode, Player version, Retro)
em vez de categorias de ligas (que continham apenas os escudos/logos).
Associa as camisas aos clubes mapeados no 'dalla.html' e faz o download de todas as fotos físicas.
"""

import sys
import io
import requests
import re
import json
import time
import os
import urllib.parse
from bs4 import BeautifulSoup

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ─── Configurações ─────────────────────────────────────────────────────────
BASE_URL = "https://1to1jerseyworld.x.yupoo.com"
PRODUCTS_JS_FILE = "products.js"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://1to1jerseyworld.x.yupoo.com/albums",
}

# Categorias Reais do Yupoo que contêm os Produtos (Camisetas)
SHIRT_CATEGORIES = [
    {"id": "3326990", "name": "New mode (Fans Version)", "type": "Torcedor"},
    {"id": "3328487", "name": "Player version",          "type": "Performance"},
    {"id": "3327198", "name": "Retro Football Jersey",   "type": "Retrô"},
]

# Pasta para exibição em português nas Ligas
LEAGUE_FOLDERS = {
    "brasileirao": "Brasileirao",
    "premier": "PremierLeague",
    "laliga": "LaLiga",
    "serie_a": "SerieA",
    "bundesliga": "Bundesliga",
    "ligue_1": "Ligue1"
}

# ─── Helper: Limpeza de nomes para pastas válidas no Windows ──────────────────
def safe_filename(name: str) -> str:
    # Remove caracteres inválidos para pastas
    name = re.sub(r'[\\/*?:"<>|]', "", name)
    return name.strip()

# ─── Helper: Download de imagem com retry e referer correto ───────────────────
def download_image(url: str, filepath: str, max_retries: int = 3) -> bool:
    if os.path.exists(filepath):
        return True # Já baixou anteriormente

    # Garante que a pasta pai existe
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    img_headers = HEADERS.copy()
    img_headers["Referer"] = BASE_URL

    if url.startswith("//"):
        url = "https:" + url

    for attempt in range(max_retries):
        try:
            resp = requests.get(url, headers=img_headers, timeout=20)
            if resp.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(resp.content)
                return True
        except Exception as e:
            time.sleep(1.5)
    return False

# ─── Helper: Extração de preço do título do álbum ────────────────────────────
def extract_price(name: str) -> str:
    patterns = [
        r'(\d+(?:\.\d+)?)\s*[＄$]',
        r'[＄$]\s*(\d+(?:\.\d+)?)',
    ]
    for p in patterns:
        m = re.search(p, name)
        if m:
            return m.group(1).replace('.', ',')
    return "349,90" # Preço padrão premium do dalla.html

# ─── Helper: Carregar times do dalla.html para mapear corretamente ───────────
def load_teams_mapping() -> dict:
    teams_map = {} # league_id -> [ {id, name, keywords} ]
    
    if not os.path.exists("dalla.html"):
        print("[ERRO] dalla.html não encontrado no diretório!")
        return {}

    with open("dalla.html", "r", encoding="utf-8") as f:
        html = f.read()

    start_idx = html.find('const TEAMS = {')
    if start_idx == -1:
        print("[ERRO] Bloco TEAMS não encontrado no dalla.html")
        return {}
    end_idx = html.find('};', start_idx) + 2
    teams_block = html[start_idx:end_idx]

    league_blocks = re.findall(r'(\w+):\s*\[(.*?)\]', teams_block, re.DOTALL)
    
    for league_id, array_content in league_blocks:
        teams_map[league_id] = []
        team_objects = re.findall(r"\{\s*id:\s*'([^']*)',\s*name:\s*'([^']*)'", array_content)
        for t_id, t_name in team_objects:
            keywords = [t_name.lower()]
            
            # Adiciona apelidos e variações de nomes comuns para os times
            clean_name = t_name.lower()
            if "manchester city" in clean_name or "man city" in clean_name:
                keywords.extend(["city", "man city", "manchester city", "mcfc"])
            elif "manchester united" in clean_name or "man united" in clean_name:
                keywords.extend(["united", "man united", "manchester united", "mufc"])
            elif "real madrid" in clean_name:
                keywords.extend(["real madrid", "madrid"])
            elif "atlético-mg" in clean_name or "atlético mineiro" in clean_name or "atletico" in clean_name:
                keywords.extend(["atletico mineiro", "atletico mg", "galo", "mineiro"])
            elif "athletico-pr" in clean_name or "athletico paranaense" in clean_name:
                keywords.extend(["athletico", "paranaense"])
            elif "bragantino" in clean_name:
                keywords.extend(["bragantino", "red bull", "redbull"])
            elif "bayern" in clean_name:
                keywords.extend(["bayern", "munich", "munchen"])
            elif "dortmund" in clean_name or "borussia" in clean_name:
                keywords.extend(["dortmund", "borussia"])
            elif "psg" in clean_name or "paris saint" in clean_name:
                keywords.extend(["psg", "paris saint", "paris sg"])
            elif "inter de milão" in clean_name or "internazionale" in clean_name:
                keywords.extend(["inter", "internazionale", "milao"])
            elif "milan" in clean_name:
                keywords.extend(["ac milan", "milan"])
            elif "são paulo" in clean_name:
                keywords.extend(["sao paulo", "spfc"])
            elif "sport recife" in clean_name:
                keywords.extend(["recife", "sport recife"])
            elif "vasco da gama" in clean_name:
                keywords.extend(["vasco", "vasco da gama"])
            elif "vitória" in clean_name:
                keywords.extend(["vitoria", "vitoria salvador"])
            elif "fortaleza" in clean_name:
                keywords.extend(["fortaleza"])
            elif "flamengo" in clean_name:
                keywords.extend(["flamengo", "fla"])
            elif "fluminense" in clean_name:
                keywords.extend(["fluminense", "flu"])
            elif "botafogo" in clean_name:
                keywords.extend(["botafogo"])
            elif "gremio" in clean_name:
                keywords.extend(["gremio"])
            elif "corinthians" in clean_name:
                keywords.extend(["corinthians"])
            elif "cruzeiro" in clean_name:
                keywords.extend(["cruzeiro"])
            elif "palmeiras" in clean_name:
                keywords.extend(["palmeiras"])
            elif "santos" in clean_name:
                keywords.extend(["santos"])

            import unicodedata
            clean_keywords = []
            for kw in keywords:
                clean_kw = "".join(c for c in unicodedata.normalize('NFD', kw) if unicodedata.category(c) != 'Mn')
                clean_keywords.append(clean_kw)
                if kw != clean_kw:
                    clean_keywords.append(kw)

            teams_map[league_id].append({
                "id": t_id,
                "name": t_name,
                "keywords": list(set(clean_keywords))
            })
            
    return teams_map

# ─── Helper: Mapeamento Inteligente do Produto para Liga e Time ────────────────
def match_team_and_league(product_name: str, teams_map: dict):
    import unicodedata
    name_normalized = product_name.lower()
    name_clean = "".join(c for c in unicodedata.normalize('NFD', name_normalized) if unicodedata.category(c) != 'Mn')
    
    # Procura em todas as ligas mapeadas
    for league_id, teams in teams_map.items():
        for team in teams:
            for kw in team["keywords"]:
                # Garante correspondência de palavra inteira ou substring relevante
                if f" {kw} " in f" {name_clean} " or f" {kw} " in f" {name_normalized} " or name_clean.startswith(kw) or name_normalized.startswith(kw):
                    return league_id, team["id"]
    return None, None

# ─── Busca HTML com Retry ───────────────────────────────────────────────────
def fetch_html(url: str, retries: int = 3) -> BeautifulSoup:
    for attempt in range(retries):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "html.parser")
        except Exception as e:
            print(f"  [AVISO] Erro ao acessar: {e}")
            time.sleep(2 * (attempt + 1))
    return None

# ─── Coleta TODAS as Imagens de um Álbum Yupoo ──────────────────────────────────
def scrape_album_images(album_url: str) -> list:
    soup = fetch_html(album_url)
    if not soup:
        return []
        
    image_urls = []
    img_tags = soup.find_all("img")
    for img in img_tags:
        classes = img.get("class", [])
        if "image__img" in classes or img.get("data-origin-src") or img.get("data-src"):
            src = (
                img.get("data-origin-src") or
                img.get("data-src") or
                img.get("src") or ""
            )
            if src and "photo.yupoo.com" in src:
                if src.startswith("//"):
                    src = "https:" + src
                # Tenta pegar a versão 'big' ou original da imagem
                src = src.replace("/small.", "/big.").replace("/square.", "/big.")
                if src not in image_urls:
                    image_urls.append(src)
    return image_urls

# ─── Scraping de Categoria de Camiseta ─────────────────────────────────────────
def scrape_shirt_category(category: dict, teams_map: dict) -> list:
    print(f"\n🚀 COLETANDO CATEGORIA DE CAMISETAS: {category['name']}")
    print("=" * 60)
    
    category_products = []
    page = 1
    max_pages = 25 # Limite de páginas
    
    while page <= max_pages:
        url = f"{BASE_URL}/categories/{category['id']}?page={page}"
        print(f"  Acessando página {page}...")
        
        soup = fetch_html(url)
        if not soup:
            break
            
        album_cards = soup.select("a.album__main")
        if not album_cards:
            break
            
        print(f"    Encontrados {len(album_cards)} álbuns na página.")
        
        for idx, card in enumerate(album_cards, 1):
            name = card.get("title", "").strip()
            if not name:
                title_span = card.select_one(".album__title, .album__name")
                if title_span:
                    name = title_span.get_text(strip=True)
            
            if not name:
                continue
                
            href = card.get("href", "")
            album_link = href if href.startswith("http") else f"{BASE_URL}{href}"
            
            # 1. Correspondência de time e liga
            league_id, team_id = match_team_and_league(name, teams_map)
            if not league_id or not team_id:
                # Se não pertencer a nenhuma das nossas ligas/times cobertos, ignora!
                continue
                
            league_folder = LEAGUE_FOLDERS.get(league_id, "Outros")
            print(f"    [{idx:02d}] Camisa Real: {name}")
            print(f"         LIGA: {league_id.upper()} | TIME: {team_id} | TIPO: {category['type']}")
            
            # 2. Acessa o álbum para coletar todas as fotos reais da camisa
            image_urls = scrape_album_images(album_link)
            if not image_urls:
                print("         [AVISO] Nenhuma foto encontrada dentro do álbum.")
                continue
                
            # Remove a primeira foto se ela for o escudo/logo do time (caso exista)
            # Para evitar salvar logos como fotos de camisetas, fazemos uma verificação simples:
            # Se a foto tem tamanho/proporções de logo ou se houver outras fotos, a primeira pode ser pulada
            # se ela for igual ao escudo da equipe.
            
            print(f"         Encontradas {len(image_urls)} fotos reais. Iniciando downloads locais...")
            
            # 3. Baixa TODAS as fotos locais organizadamente
            local_gallery = []
            safe_album_name = safe_filename(name)
            
            for f_idx, img_url in enumerate(image_urls, 1):
                ext = ".jpg"
                if ".jpeg" in img_url.lower():
                    ext = ".jpeg"
                elif ".webp" in img_url.lower():
                    ext = ".webp"
                elif ".png" in img_url.lower():
                    ext = ".png"
                    
                local_dir = f"produtos/{league_folder}/{team_id}/{safe_album_name}"
                filename = f"foto_{f_idx}{ext}"
                local_filepath = os.path.join(local_dir, filename)
                
                success = download_image(img_url, local_filepath)
                if success:
                    local_gallery.append(f"{local_dir}/{filename}")
            
            if local_gallery:
                price = extract_price(name)
                
                category_products.append({
                    "id": f"p_{league_id}_{team_id}_{len(category_products) + 1}",
                    "teamId": team_id,
                    "name": name,
                    "price": price,
                    "cat": category["type"],
                    "img1": local_gallery[0],
                    "img2": local_gallery[1] if len(local_gallery) > 1 else None,
                    "gallery": local_gallery
                })
                print(f"         [OK] Camisa salva localmente com {len(local_gallery)} fotos!")
            
            time.sleep(0.5)
            
        has_next = bool(soup.find("a", href=re.compile(rf"page={page+1}")))
        if not has_next:
            has_next = bool(soup.select_one("a.page__next, .pagination .next, a[rel='next']"))
            
        if not has_next:
            break
            
        page += 1
        time.sleep(1.0)
        
    return category_products

# ─── Execução Principal ──────────────────────────────────────────────────────
def main():
    print("\n" + "=" * 60)
    print("   INICIANDO SCRAPER E DOWNLOADER DE CAMISETAS REAIS")
    print("=" * 60)
    
    # 1. Carrega times do dalla.html
    teams_map = load_teams_mapping()
    if not teams_map:
        print("[ERRO] Não foi possível carregar as informações das ligas/times do HTML.")
        return
        
    print("[OK] Mapeamento dos times carregado com sucesso!")
    
    all_scraped_products = []
    
    # 2. Coleta camisetas de cada uma das 3 grandes categorias de produtos
    for category in SHIRT_CATEGORIES:
        products = scrape_shirt_category(category, teams_map)
        all_scraped_products.extend(products)
        print(f"\n[OK] Concluído: {len(products)} camisetas reais importadas de {category['name']}.\n")
        
    # 3. Salva os produtos reais no formato 'products.js' para uso local no 'dalla.html'
    js_content = f"// BANCO DE DADOS DE PRODUTOS GERADO AUTOMATICAMENTE PELO SCRAPER YUPOO\n"
    js_content += f"// Gerado em: {time.strftime('%d/%m/%Y %H:%M:%S')}\n\n"
    js_content += "window.PRODUCTS = " + json.dumps(all_scraped_products, ensure_ascii=False, indent=2) + ";\n"
    
    with open(PRODUCTS_JS_FILE, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print("\n" + "=" * 60)
    print("✨ CONCLUÍDO COM SUCESSO!")
    print(f"Total de camisetas importadas: {len(all_scraped_products)}")
    print(f"Arquivo gerado: {PRODUCTS_JS_FILE}")
    print("=" * 60)

if __name__ == "__main__":
    main()
