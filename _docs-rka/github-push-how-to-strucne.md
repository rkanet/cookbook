# Změna přístupu na GitHub pro tento web

## Co se změnilo

Repozitář byl přepnut z SSH adresy:

```text
git@github.com:rkanet/kitchen.git
```

na HTTPS adresu:

```text
https://github.com/rkanet/cookbook.git
```

Změna je uložená v souboru `.git/config` v položce `remote "origin"`.

## Proč se to měnilo

Původní nastavení používalo PuTTY / Pageant:

- `plink.exe`
- `.ppk` klíč
- SSH přístup na GitHub

To vedlo k tomu, že `Push` nebo `Sync` ve VS Code někdy visel nebo končil
chybou ověření, protože:

- chyběl nahraný klíč v `Pageant`, nebo
- už nebyl dostupný původní `.ppk` soubor

V logu bylo zároveň vidět, že GitHub už starý repozitář `rkanet/kitchen`
přesměrovával na nové umístění `rkanet/cookbook`.

## Co to znamená teď

Pro `git push` už není potřeba:

- SSH klíč
- `.ppk` soubor
- `Pageant`
- `PuTTY`

VS Code a Git budou používat HTTPS přístup. Ověření by mělo proběhnout přes
GitHub přihlášení v systému nebo přes GitHub CLI credential helper, který je
už v globální Git konfiguraci nastavený.

## Jak poznat, že je vše správně

V terminálu v kořeni projektu má vrátit:

```bash
git remote -v
```

adresu podobnou:

```text
origin  https://github.com/rkanet/cookbook.git (fetch)
origin  https://github.com/rkanet/cookbook.git (push)
```

## Co dělat, když push bude chtít přihlášení

Pokud se Git nebo VS Code zeptá na přihlášení k GitHubu, přihlaste se běžně
přes GitHub účet. Není potřeba hledat starý `.ppk` klíč.

Pokud by přihlášení i tak nefungovalo, nejjednodušší další krok je znovu
autorizovat GitHub CLI:

```bash
gh auth login
```

## Deploy webu se nemění

Tato změna se týká jen přístupu do GitHub repozitáře.

Samotné publikování webu zůstává stejné:

1. lokálně se upraví soubory
2. změny se odešlou přes `git push`
3. GitHub Actions automaticky sestaví web
4. GitHub Pages ho publikuje
