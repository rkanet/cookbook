# Vyhledávání na cookbook stránkách

## Přehled

Client-side fulltextové vyhledávání pomocí knihovny Fuse.js. Vyhledávací pole je umístěno ve footeru stránky.

## Komponenty

### 1. Search index (`index.json`)

**Soubor:** `themes/StronglyTyped/layouts/_default/index.json`

Šablona generuje JSON index všech receptů při buildu Hugo. Obsahuje:
- `title` - název receptu
- `url` - absolutní URL (`.Permalink`)
- `content` - prvních 1500 znaků textu receptu

**Výstup:** `/index.json` v root webu

### 2. JavaScript (`search.js`)

**Soubor:** `static/js/search.js`

Funkce:
- Načtení indexu při focusu na vyhledávací pole
- Normalizace textu (odstranění diakritiky, lowercase)
- Vyhledávání pomocí Fuse.js (fuzzy matching)
- Zobrazení výsledků s úryvkem a zvýrazněním hledaného textu
- Debounce 300ms při psaní
- Zavření výsledků klávesou Escape nebo klikem mimo

**Minimální délka dotazu:** 3 znaky

### 3. Styly (`search.css`)

**Soubor:** `static/css/search.css`

Styly konzistentní s tématem StronglyTyped:
- Input pole s inset shadow
- Dropdown výsledků
- Hover efekty
- Responsivní design

### 4. Footer s vyhledáváním

**Soubor:** `themes/StronglyTyped/layouts/partials/footer.html`

HTML struktura vyhledávacího formuláře s ikonou lupy.

## Konfigurace

V `config.toml` je nutné povolit JSON output:

```toml
[outputs]
  home = ["HTML", "JSON"]
```

## Závislosti

- **Fuse.js v7** - načítáno z CDN v `baseof.html`
- **Font Awesome** - ikona lupy (již součástí tématu)

## Jak funguje URL

Hugo funkce `.Permalink` automaticky generuje správnou URL:
- `hugo server` → `http://localhost:PORT/cookbook/...`
- `hugo` (build) → `https://rkanet.github.io/cookbook/...`

## Známá omezení

**Omezení délky indexovaného textu:** Index obsahuje pouze prvních 1500 znaků každého receptu. Text za touto hranicí není prohledáván. Při průměrné délce receptu ~1700 znaků je většina obsahu pokryta, ale u delších receptů (max ~6000 znaků) může být část textu mimo dosah vyhledávání.

Při potřebě lze limit upravit v `index.json` šabloně (hodnota `truncate`). Vyšší limit = větší index.json soubor.

## Soubory k úpravě při změnách

| Soubor | Účel |
|--------|------|
| `themes/.../layouts/_default/index.json` | Struktura indexu |
| `static/js/search.js` | Logika vyhledávání |
| `static/css/search.css` | Vzhled |
| `themes/.../layouts/partials/footer.html` | HTML struktura |
| `themes/.../layouts/_default/baseof.html` | Načtení CSS/JS |
