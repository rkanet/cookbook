# Jak se stránky dostanou z lokálního disku na internet

## Přehled

Stránky jsou postavené na generátoru **Hugo**. Zdrojové soubory (texty receptů,
obrázky, šablony) žijí lokálně na disku. Po odeslání změn na GitHub se stránky
automaticky sestaví a publikují na adrese:

    https://rkanet.github.io/cookbook

Celý proces je automatický — stačí udělat `git push`.

---

## Co je co

| Pojem | Vysvětlení |
|---|---|
| **Hugo** | Program, který z Markdown souborů vygeneruje hotový web (HTML, CSS, JS). |
| **GitHub** | Služba, kde je uložený zdrojový kód projektu (repozitář `rkanet/kitchen`). |
| **GitHub Pages** | Funkce GitHubu, která umí výsledný web zdarma hostovat na internetu. |
| **GitHub Actions** | Automatika na GitHubu — po každém push spustí předepsané kroky. |

---

## Kroky od úpravy po živý web

```
  LOKÁLNÍ DISK                     GITHUB                     INTERNET
  ────────────                     ──────                     ────────
  1. Upravíš soubor          ──►  3. GitHub Actions          ──►  5. Web je živý
     (např. recept.md)             spustí workflow                 rkanet.github.io
  2. git add + commit + push ──►  4. Hugo sestaví web              /cookbook
                                     a nasadí ho
```

### 1. Úprava obsahu (lokálně)

Recepty a další obsah jsou v adresáři `content/`. Každý recept je Markdown
soubor, např. `content/recepty/25-01-rychle-placky-z-kvasku.md`.

Obrázky patří do `static/img/`.

### 2. Odeslání změn na GitHub

V terminálu (Git Bash, VS Code terminál...):

```bash
git add content/recepty/novy-recept.md
git add static/img/foto-receptu.jpg
git commit -m "nový recept: palačinky"
git push origin master
```

- `git add` — přidá soubory ke commitu
- `git commit` — vytvoří „balíček změn" s popisem
- `git push` — odešle commit na GitHub

### 3. GitHub Actions automaticky spustí workflow

Soubor `.github/workflows/hugo.yml` říká GitHubu, co má dělat po každém push
na větev `master`:

1. Stáhne si aktuální kód repozitáře (včetně šablony/theme).
2. Nainstaluje Hugo (verze 0.152.2, extended).
3. Spustí příkaz `hugo --minify`, který vygeneruje celý web do složky `docs/`.
4. Výsledek nahraje jako artefakt a nasadí ho na GitHub Pages.

### 4. Web je živý

Po dokončení (cca 1–2 minuty) je nová verze webu dostupná na:

    https://rkanet.github.io/cookbook

---

## Důležité soubory

| Soubor / adresář | Účel |
|---|---|
| `config.toml` | Hlavní konfigurace Hugo — název webu, téma, menu, URL. |
| `.github/workflows/hugo.yml` | Workflow pro automatické sestavení a nasazení. |
| `content/` | Zdrojové texty (recepty, how-to, galerie). |
| `static/` | Statické soubory — obrázky, soubory ke stažení. |
| `layouts/` | Vlastní úpravy šablon. |
| `themes/StronglyTyped/` | Použitý grafický motiv. |
| `docs/` | Vygenerovaný web (je v `.gitignore`, necommituje se). |
| `.gitignore` | Seznam souborů, které Git ignoruje. |

---

## Jak si web prohlédnout lokálně (před pushem)

Pokud máš Hugo nainstalovaný lokálně:

```bash
hugo server
```

Otevři v prohlížeči `http://localhost:1313/cookbook/`. Stránky se automaticky
obnovují při každé uložené změně.

---

## Nové PC — jak se znovu napojit na GitHub

Pokud máš na novém počítači jen vygenerované stránky (složku `docs/`),
zdrojové soubory je potřeba stáhnout z GitHubu. Složka `docs/` sama o sobě
nestačí — potřebuješ celý repozitář se zdrojovými Markdown soubory.

### Krok za krokem

#### 1. Nainstaluj Git

Stáhni z https://git-scm.com/downloads a nainstaluj. Po instalaci ověř:

```bash
git --version
```

#### 2. Nainstaluj Hugo (extended verze)

Stáhni z https://gohugo.io/installation/ — vyber **extended** verzi. Ověř:

```bash
hugo version
```

Ve výpisu musí být slovo `extended`.

#### 3. Nastav přístup ke GitHubu

Aby šlo stahovat a odesílat kód, potřebuješ se u GitHubu ověřit.
Nejjednodušší způsob je přes HTTPS s osobním tokenem:

1. Na GitHubu: **Settings → Developer settings → Personal access tokens →
   Tokens (classic) → Generate new token**.
2. Zaškrtni oprávnění **repo** (celý řádek).
3. Token si zkopíruj a ulož na bezpečné místo (zobrazí se jen jednou).
4. Při prvním `git push` zadej jako heslo tento token.

Alternativně můžeš použít SSH klíč — viz
https://docs.github.com/en/authentication/connecting-to-github-with-ssh

#### 4. Naklonuj repozitář

```bash
cd /c/Renik/work/Websites
git clone --recurse-submodules https://github.com/rkanet/kitchen.git rka-cookbook
```

Přepínač `--recurse-submodules` stáhne i šablonu (theme), která je uložená
jako submodul.

#### 5. Ověř, že vše funguje lokálně

```bash
cd rka-cookbook
hugo server
```

Otevři `http://localhost:1313/cookbook/` — měl by se zobrazit funkční web.

#### 6. Hotovo — pracuj jako dřív

Od teď stačí upravovat soubory v `content/`, commitovat a pushovat:

```bash
git add content/recepty/novy-recept.md
git commit -m "nový recept"
git push origin master
```

GitHub Actions se postará o zbytek.

### Co s přenesenými statickými stránkami?

Složku `docs/`, kterou jsi přenesla z původního PC, **nepotřebuješ** —
můžeš ji smazat. Generuje se automaticky při každém buildu na GitHubu
i při lokálním `hugo server`. Zdrojová data jsou bezpečně na GitHubu.

---

## Co když něco nefunguje

1. **Push prošel, ale web se neaktualizoval** — na GitHubu v záložce
   Actions zkontroluj, zda workflow doběhl bez chyby.
2. **Workflow selhal** — klikni na červený křížek u posledního běhu a přečti
   chybový log. Nejčastější příčina: chyba v Markdown souboru nebo chybějící
   obrázek.
3. **Lokální `hugo server` nefunguje** — ověř, že máš nainstalovanou
   extended verzi Hugo (`hugo version`).
4. **Ztratila jsem GitHub token** — nic se neděje, starý token nelze
   obnovit, ale můžeš si jednoduše vytvořit nový:
   1. Na GitHubu: **Settings → Developer settings → Personal access tokens →
      Tokens (classic)**.
   2. Starý token můžeš smazat (tlačítko **Delete**).
   3. Klikni **Generate new token**, zaškrtni oprávnění **repo**, vygeneruj.
   4. Nový token si zkopíruj a ulož na bezpečné místo.
   5. Při dalším `git push` zadej nový token jako heslo. Pokud si Git
      pamatuje staré heslo, vymaž ho příkazem:
      ```bash
      git credential reject <<EOF
      host=github.com
      protocol=https
      EOF
      ```
      Při příštím push se Git zeptá znovu a zadáš nový token.
