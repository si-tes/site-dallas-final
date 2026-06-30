#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Debug: Analisa o HTML raw de uma categoria e de um album para descobrir a estrutura"""

import sys, io, requests, re, json
from bs4 import BeautifulSoup

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_URL = "https://1to1jerseyworld.x.yupoo.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",  # Ingles para evitar traducao
    "Referer": "https://1to1jerseyworld.x.yupoo.com/albums",
}

print("=" * 60)
print("PARTE 1: Analisando pagina de CATEGORIA (Brasileirao)")
print("=" * 60)

url = f"{BASE_URL}/categories/3878608"
resp = requests.get(url, headers=HEADERS, timeout=15)
soup = BeautifulSoup(resp.text, "html.parser")

# Busca todos os links de album
all_links = soup.find_all("a", href=re.compile(r"/albums/\d+"))
print(f"Total de links de album: {len(all_links)}")

# Analisa o primeiro link de album em detalhe
print("\n--- HTML dos primeiros 3 links de album ---")
for i, link in enumerate(all_links[:3], 1):
    print(f"\n[Link {i}] href={link.get('href')}")
    print(f"  HTML interno: {str(link)[:300]}")
    print(f"  Texto: {link.get_text(strip=True)[:100]}")
    img = link.find("img")
    if img:
        print(f"  IMG src={img.get('src')}")
        print(f"  IMG data-src={img.get('data-src')}")
        print(f"  IMG alt={img.get('alt')}")
        print(f"  IMG atributos: {dict(img.attrs)}")

# Busca JSON embutido na pagina (window.__INITIAL_STATE__ ou similar)
print("\n--- Buscando JSON embutido na pagina ---")
scripts = soup.find_all("script")
for sc in scripts:
    content = sc.string or ""
    if "album" in content.lower() and len(content) > 100:
        print(f"Script com 'album' encontrado ({len(content)} chars):")
        print(content[:500])
        print("...")
        break

# Pega o primeiro album link para buscar a pagina do album
first_album = all_links[0].get("href", "") if all_links else ""
if first_album:
    full_album_url = first_album if first_album.startswith("http") else BASE_URL + first_album
    print(f"\n{'='*60}")
    print(f"PARTE 2: Analisando pagina de ALBUM")
    print(f"URL: {full_album_url}")
    print("=" * 60)

    resp2 = requests.get(full_album_url, headers=HEADERS, timeout=15)
    soup2 = BeautifulSoup(resp2.text, "html.parser")

    # Titulo
    title_tag = soup2.find("title")
    h1_tag = soup2.find("h1")
    print(f"Titulo da pagina: {title_tag.get_text(strip=True) if title_tag else 'N/A'}")
    print(f"H1: {h1_tag.get_text(strip=True) if h1_tag else 'N/A'}")

    # Imagens
    imgs = soup2.find_all("img")
    print(f"\nTotal de <img> na pagina: {len(imgs)}")
    for img in imgs[:5]:
        attrs = dict(img.attrs)
        print(f"  IMG: {attrs}")

    # JSON embutido
    print("\n--- JSON embutido no album ---")
    scripts2 = soup2.find_all("script")
    for sc in scripts2:
        content = sc.string or ""
        if len(content) > 200 and ("photo" in content.lower() or "image" in content.lower() or "src" in content.lower()):
            print(f"Script relevante ({len(content)} chars):")
            print(content[:800])
            print("---")
            break

    # Meta tags OG
    print("\n--- Meta tags OG ---")
    for meta in soup2.find_all("meta"):
        prop = meta.get("property", "") or meta.get("name", "")
        if "og:" in prop or "image" in prop.lower() or "title" in prop.lower():
            print(f"  <meta {prop}> = {meta.get('content', '')[:150]}")
