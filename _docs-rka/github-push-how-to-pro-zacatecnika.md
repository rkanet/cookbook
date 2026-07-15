# Jak teď funguje odesílání na GitHub bez `.ppk` klíče

## Krátké vysvětlení pro začátečníka

Dříve se počítač ke GitHubu přihlašoval pomocí SSH klíče ve formátu `.ppk`.
To je soubor pro PuTTY / Pageant.

Teď už to tak není.

Repozitář používá běžnou webovou adresu:

```text
https://github.com/rkanet/cookbook.git
```

To znamená, že při odesílání změn na GitHub:

- se nepoužívá `.ppk` klíč
- nepoužívá se `Pageant`
- nepoužívá se `PuTTY`

Místo toho se Git přihlašuje přes HTTPS, podobně jako když se člověk
přihlašuje na web.

## Co se děje při práci

Když upravíte recept nebo jiný soubor, změna je zatím jen na vašem počítači.

Aby se dostala na GitHub, proběhnou tyto kroky:

1. soubor upravíte a uložíte
2. Git změnu zařadí do commitu
3. vytvoří se commit s popisem změny
4. commit se odešle na GitHub přes HTTPS
5. GitHub Actions po pushi automaticky sestaví web
6. GitHub Pages zveřejní novou verzi webu

## Jak je to s přihlášením

Při prvním odeslání změn může Git nebo VS Code chtít přihlášení ke GitHubu.

To je v pořádku. Není potřeba žádný `.ppk` soubor.

Stačí se přihlásit běžně ke GitHub účtu. Po úspěšném přihlášení si systém
přístup obvykle zapamatuje, takže příště už se znovu ptát nemusí.

## Jak probíhá autorizace bez klíče

Dříve se GitHub ověřoval pomocí SSH klíče. To byl soubor `.ppk`, který
musel být dostupný v PuTTY / Pageant.

Teď autorizace probíhá jinak:

1. `git push` se připojí na adresu `https://github.com/...`
2. Git nebo VS Code zjistí, že je potřeba ověření
3. otevře přihlášení ke GitHubu, nebo použije už uložené přihlášení
4. po přihlášení dostane Git oprávnění změny odeslat
5. systém si toto oprávnění obvykle zapamatuje

To znamená, že místo souboru s klíčem se používá běžné GitHub přihlášení.

## Jak poznat, že je repozitář nastavený správně

V souboru `.git/config` je dnes jako `origin` nastaveno:

```text
https://github.com/rkanet/cookbook.git
```

V terminálu to lze ověřit příkazem:

```bash
git remote -v
```

Výpis má vypadat přibližně takto:

```text
origin  https://github.com/rkanet/cookbook.git (fetch)
origin  https://github.com/rkanet/cookbook.git (push)
```

## Postup ve Visual Studio Code

### Nejjednodušší běžná práce

1. Otevřete projekt ve VS Code.
2. Upravte soubor a uložte ho.
3. V levém panelu otevřete záložku `Source Control`.
4. U změněných souborů klikněte na `+` nebo na `Stage All Changes`.
5. Napište stručný popis změny.
6. Klikněte na `Commit`.
7. Klikněte na `Sync Changes` nebo `Push`.

### Co se může stát při prvním pushi

VS Code může otevřít přihlášení ke GitHubu.

Pak stačí:

1. potvrdit přihlášení
2. přihlásit se ke GitHub účtu
3. povolit přístup

Pak by měl `Push` doběhnout bez potřeby SSH klíče.

## Postup z libovolného terminálu

Může to být PowerShell, CMD, Git Bash nebo terminál ve VS Code.

### Běžný postup

1. Přejděte do složky projektu.
2. Přidejte změny.
3. Vytvořte commit.
4. Odešlete ho na GitHub.

Příklady příkazů:

```bash
cd C:\Renik\work\Websites\rka-cookbook
git add .
git commit -m "nový recept"
git push origin master
```

### Co se může stát při prvním pushi

Terminál může chtít přihlášení ke GitHubu.

Pak se normálně přihlaste ke GitHub účtu. Opět není potřeba žádný `.ppk`
klíč.

Pokud by přihlášení nešlo, lze obnovit přístup přes:

```bash
gh auth login
```

## Co se nezměnilo

Změnil se jen způsob přístupu do GitHub repozitáře.

Nezměnil se způsob publikace webu:

1. změny odešlete na GitHub
2. GitHub Actions automaticky spustí build
3. GitHub Pages publikuje nový web
