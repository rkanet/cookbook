# Vyhledávání na cookbook stránkách

## Přehled

Client-side fulltextové vyhledávání s kombinovaným algoritmem (přesná shoda + word boundary). Vyhledávací pole je umístěno ve footeru stránky.

## Jak vyhledávání funguje

### Algoritmus

Vyhledávání kombinuje dva přístupy:

1. **Přesná shoda** - hledá zadaný text kdekoliv v textu
2. **Word boundary** - hledá text na začátku slov (za mezerou, interpunkcí)

### Skórování výsledků

| Typ shody | Body |
|-----------|------|
| Přesná shoda v titulku | +3 |
| Přesná shoda v obsahu | +2 |
| Word boundary v titulku | +1 |
| Word boundary v obsahu | +1 |

Výsledky jsou seřazeny podle skóre (nejvyšší první).

### Příklad

Hledání "rajč":

| Výsledek | Skóre | Důvod |
|----------|-------|-------|
| Rajčatová polévka | 4 | přesná v titulku (3) + word boundary v obsahu (1) |
| Guláš s rajčaty | 2 | přesná v obsahu (2) |
| Salát | 1 | word boundary v obsahu (1) |

### Podpora české deklinace

Word boundary matching zachytí různé tvary slov:
- "mrkv" najde: mrkev, mrkve, mrkví, mrkvová, mrkvový
- "rajč" najde: rajče, rajčata, rajčatová

**Důležité:** Nenajde slova, kde je hledaný text uprostřed slova.
- "raj" nenajde "nakrájet" (není na začátku slova)

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
- Kombinované vyhledávání (přesná shoda + word boundary)
- Skórování a řazení výsledků
- Zobrazení výsledků s úryvkem a zvýrazněním hledaného textu
- Debounce 300ms při psaní
- Zavření výsledků klávesou Escape nebo klikem mimo

**Minimální délka dotazu:** 3 znaky

#### Hlavní funkce

| Funkce | Účel |
|--------|------|
| `normalizeText()` | Odstranění diakritiky, lowercase |
| `hasExactMatch()` | Kontrola přesné shody |
| `hasWordBoundaryMatch()` | Kontrola shody na začátku slova |
| `scoreResult()` | Výpočet skóre relevance |
| `createSnippet()` | Vytvoření úryvku se zvýrazněním |
| `performSearch()` | Hlavní vyhledávací logika |

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

- **Font Awesome** - ikona lupy (již součástí tématu)
- Žádné externí knihovny (čistý JavaScript)

## Jak funguje URL

Hugo funkce `.Permalink` automaticky generuje správnou URL:
- `hugo server` → `http://localhost:PORT/cookbook/...`
- `hugo` (build) → `https://rkanet.github.io/cookbook/...`

## Známá omezení

**Omezení délky indexovaného textu:** Index obsahuje pouze prvních 1500 znaků každého receptu. Text za touto hranicí není prohledáván.

**Word boundary a složeniny:** Algoritmus nenajde hledaný text uprostřed složených slov. Např. "masový" nenajde "bezmasový".

## Soubory k úpravě při změnách

| Soubor | Účel |
|--------|------|
| `themes/.../layouts/_default/index.json` | Struktura indexu |
| `static/js/search.js` | Logika vyhledávání |
| `static/css/search.css` | Vzhled |
| `themes/.../layouts/partials/footer.html` | HTML struktura |
| `themes/.../layouts/_default/baseof.html` | Načtení CSS/JS |

## Debugging Hugo šablon

Pro zjištění, která šablona se používá a jaký typ stránky se zobrazuje, lze dočasně přidat debug blok do šablony:

```html
<pre>
Kind: {{ .Kind }}
Type: {{ .Type }}
Section: {{ .Section }}
Template: {{ templates.Current.Filename }}
</pre>
```

**Vysvětlení:**
- `Kind` - typ stránky (home, page, section, taxonomy, term)
- `Type` - content type (obvykle název složky v content/)
- `Section` - sekce obsahu
- `Template` - absolutní cesta k použité šabloně

**Pozor:** Nezapomeňte debug blok před deployem odstranit!
