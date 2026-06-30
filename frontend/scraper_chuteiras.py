#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scraper de Chuteiras Premium (合一鞋业soccer shoes)
Coleta as chuteiras mais bonitas direto do catálogo Yupoo yongyumeimei,
baixa todas as fotos em alta resolução, e adiciona-as ao 'products.js'
nas categorias "Chuteira Futsal" e "Chuteira Campo"!
"""

import sys
import io
import requests
import re
import json
import time
import os
from bs4 import BeautifulSoup

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ─── Configurações ─────────────────────────────────────────────────────────
BOOTS_URL = "https://yongyumeimei.x.yupoo.com"
PRODUCTS_JS_FILE = "products.js"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": BOOTS_URL,
}

# ─── Helper: Limpeza de nomes para pastas válidas no Windows ──────────────────
def safe_filename(name: str) -> str:
    name = re.sub(r'[\\/*?:"<>|]', "", name)
    return name.strip()

# ─── Helper: Download de imagem com retry e referer correto ───────────────────
def download_image(url: str, filepath: str, max_retries: int = 3) -> bool:
    if os.path.exists(filepath):
        return True

    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    img_headers = HEADERS.copy()
    img_headers["Referer"] = BOOTS_URL

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
            time.sleep(1.0)
    return False

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

# ─── Coleta TODAS as Imagens de um Álbum de Chuteiras ──────────────────────────
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
                src = src.replace("/small.", "/big.").replace("/square.", "/big.")
                if src not in image_urls:
                    image_urls.append(src)
    return image_urls

# ─── Main Execution ───────────────────────────────────────────────────────────
def main():
    print("\n" + "=" * 60)
    print("   INICIANDO SCRAPER E DOWNLOADER DE CHUTEIRAS PREMIUM")
    print("=" * 60)
    
    # 1. Carrega banco de dados existente products.js para não apagar o que já temos
    existing_products = []
    if os.path.exists(PRODUCTS_JS_FILE):
        try:
            with open(PRODUCTS_JS_FILE, "r", encoding="utf-8") as f:
                content = f.read()
                # Encontra o bloco JSON do window.PRODUCTS
                json_start = content.find("window.PRODUCTS = ")
                if json_start != -1:
                    json_str = content[json_start + len("window.PRODUCTS = "):].strip()
                    # Remove o ponto e vírgula no final se houver
                    if json_str.endswith(";"):
                        json_str = json_str[:-1]
                    existing_products = json.loads(json_str)
                    print(f"[OK] Carregadas {len(existing_products)} camisetas existentes do products.js")
        except Exception as e:
            print(f"[AVISO] Não foi possível ler products.js existente: {e}. Iniciando banco novo.")

    # Remove qualquer chuteira existente no banco anterior para reinserir com os dados locais frescos
    filtered_products = [p for p in existing_products if not p.get("cat", "").startswith("Chuteira")]

    # 2. Varre as chuteiras mais bonitas do catálogo
    print("\n🚀 Acessando catálogo de chuteiras...")
    soup = fetch_html(f"{BOOTS_URL}/albums?page=1")
    if not soup:
        print("[ERRO] Não foi possível carregar a página de chuteiras.")
        return
        
    # No yongyumeimei as classes dos links são album3__main ou album__main
    cards = soup.select("a.album3__main, a.album__main")
    if not cards:
        print("[ERRO] Nenhum álbum de chuteira encontrado no catálogo.")
        return
        
    print(f"[OK] Encontrados {len(cards)} álbuns no total. Coletando os 12 melhores modelos do DEV!")
    
    scraped_boots = []
    # Coletamos no máximo 12 modelos super premium (Nike, Adidas, etc.)
    max_boots = 12
    count = 0
    
    for idx, card in enumerate(cards):
        title = card.get("title", "").strip()
        if not title:
            title_span = card.select_one(".album__title, .album__name")
            if title_span:
                title = title_span.get_text(strip=True)
                
        if not title:
            continue
            
        # Filtra marcas populares
        title_lower = title.lower()
        if not ("nike" in title_lower or "adidas" in title_lower or "puma" in title_lower or "asics" in title_lower or "predator" in title_lower or "mercurial" in title_lower):
            continue
            
        href = card.get("href", "")
        album_link = href if href.startswith("http") else f"{BOOTS_URL}{href}"
        
        # Identifica tipo de chuteira (Campo FG/SG vs Futsal/Society/Turf TF/IC)
        cat = "Chuteira Campo"
        if "tf" in title_lower or "ic" in title_lower or "indoor" in title_lower or "futsal" in title_lower or "finale" in title_lower:
            cat = "Chuteira Futsal"
            
        # Identifica a Marca
        brand = "nike"
        if "adidas" in title_lower or "predator" in title_lower:
            brand = "adidas"
        elif "puma" in title_lower:
            brand = "puma"
        elif "asics" in title_lower:
            brand = "asics"
            
        print(f"\n  [{count+1:02d}] Chuteira: {title}")
        print(f"       TIPO: {cat} | MARCA: {brand.upper()}")
        
        # 3. Acessa álbum e baixa todas as fotos reais do calçado
        image_urls = scrape_album_images(album_link)
        if not image_urls:
            print("       [AVISO] Nenhuma foto encontrada dentro do álbum.")
            continue
            
        print(f"       Encontradas {len(image_urls)} fotos. Baixando em alta resolução...")
        
        local_gallery = []
        safe_album_name = safe_filename(title)
        
        # Baixa no máximo 6 fotos por chuteira para economizar banda/tempo
        for f_idx, img_url in enumerate(image_urls[:6], 1):
            ext = ".jpg"
            if ".jpeg" in img_url.lower():
                ext = ".jpeg"
            elif ".png" in img_url.lower():
                ext = ".png"
                
            local_dir = f"produtos/Chuteiras/{brand}/{safe_album_name}"
            filename = f"foto_{f_idx}{ext}"
            local_filepath = os.path.join(local_dir, filename)
            
            success = download_image(img_url, local_filepath)
            if success:
                local_gallery.append(f"{local_dir}/{filename}")
                
        if local_gallery:
            scraped_boots.append({
                "id": f"p_local_chuteira_{brand}_{count + 1}",
                "teamId": brand, # Usado como ID da categoria de marca/chuteira no site
                "name": title,
                "price": "499,90", # Preço premium de chuteiras
                "cat": cat,
                "img1": local_gallery[0],
                "img2": local_gallery[1] if len(local_gallery) > 1 else None,
                "gallery": local_gallery
            })
            print(f"       [OK] Chuteira salva localmente com {len(local_gallery)} fotos!")
            count += 1
            if count >= max_boots:
                break
                
        time.sleep(0.5)
        
    # 4. Junta as chuteiras com as camisetas existentes
    final_products = filtered_products + scraped_boots
    
    # 5. Salva de volta em products.js
    js_content = f"// BANCO DE DADOS DE PRODUTOS COMPLETO COM CAMISETAS E CHUTEIRAS\n"
    js_content += f"// Gerado em: {time.strftime('%d/%m/%Y %H:%M:%S')}\n\n"
    js_content += "window.PRODUCTS = " + json.dumps(final_products, ensure_ascii=False, indent=2) + ";\n"
    
    with open(PRODUCTS_JS_FILE, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print("\n" + "=" * 60)
    print("✨ CHUTEIRAS COLETADAS E ADICIONADAS AO BANCO DE DADOS!")
    print(f"Total de chuteiras importadas: {len(scraped_boots)}")
    print(f"Total global no products.js: {len(final_products)}")
    print("=" * 60)

if __name__ == "__main__":
    main()
