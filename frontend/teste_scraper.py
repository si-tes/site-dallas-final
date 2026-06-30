#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Teste rapido com a estrutura correta do Yupoo"""

import sys, io, requests, re
from bs4 import BeautifulSoup

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_URL = "https://1to1jerseyworld.x.yupoo.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

print("[TESTE] Buscando Brasileirao - pagina 1...")
url = f"{BASE_URL}/categories/3878608"
resp = requests.get(url, headers=HEADERS, timeout=15)
soup = BeautifulSoup(resp.text, "html.parser")

# Metodo correto: a.album__main com atributo title
cards = soup.select("a.album__main")
print(f"[INFO] Cards encontrados: {len(cards)}")

products = []
for card in cards:
    name = card.get("title", "").strip()
    if not name:
        continue
    img = card.find("img")
    image_url = ""
    if img:
        image_url = img.get("data-src") or img.get("src") or ""
        image_url = image_url.replace("/small.", "/medium.")
    href = card.get("href", "")
    full_link = href if href.startswith("http") else f"{BASE_URL}{href}"
    products.append({"name": name, "image": image_url, "link": full_link})

print(f"\n[RESULTADO] {len(products)} produtos encontrados!\n")
for i, p in enumerate(products, 1):
    print(f"  [{i:02d}] {p['name']}")
    img_preview = p['image'][:70] + "..." if len(p['image']) > 70 else p['image']
    print(f"       IMG: {img_preview}")
    print()

has_images = sum(1 for p in products if p['image'])
print(f"[OK] Com imagem: {has_images}/{len(products)}")
if len(products) > 0:
    print("[OK] TESTE PASSOU! Rode: py scraper_yupoo.py")
