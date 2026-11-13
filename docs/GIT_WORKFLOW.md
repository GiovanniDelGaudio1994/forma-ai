# Come fare commit professionali — Git/GitHub su Mac

Una guida pratica per gli aggiornamenti di **Portfolio, FORMA AI e LegacyBridge**. I repository privati restano separati. Per le operazioni che toccano il dominio pubblico, le modifiche passano prima dai test CI.

## 1. Cosa significano i termini

- **Branch**: una linea di lavoro isolata. Esempio: `feat/education-logo`.
- **Commit**: uno snapshot versionato di una singola modifica coerente.
- **Push**: invia il commit dal tuo Mac a GitHub.
- **Pull Request**: propone il branch a `main`, mostrando differenze e risultati dei test.
- **Squash and merge**: pubblica su `main` un singolo commit pulito per ogni modifica logica.

Il solo `git commit` **non** aggiorna il sito. Il deployment GitHub Pages avviene dopo il merge su `main` quando il relativo workflow termina con successo.

## 2. Prima configurazione sul Mac

Da Terminale, dopo avere verificato l'accesso con GitHub CLI (`gh auth status`):

```bash
mkdir -p ~/development
cd ~/development
gh repo clone GiovanniDelGaudio1994/forma-ai
cd forma-ai
git remote -v
git status -sb
```

Se la cartella `~/development/forma-ai` esiste **già**, non clonare di nuovo: aprila con `cd ~/development/forma-ai` e controlla `git remote -v`.

Imposta in Git il nome e l'email che desideri associare ai commit usando i dati scelti nelle tue impostazioni GitHub; non pubblicare qui un indirizzo privato.

## 3. Preparare una modifica senza rischiare `main`

```bash
cd ~/development/forma-ai
git status -sb
git switch main
git pull --ff-only origin main
git switch -c feat/descrizione-breve
```

Non eseguire `git pull` se hai modifiche locali non salvate: prima verifica `git status`.

**Nomi consigliati:** `feat/atlante-exercises`, `fix/mobile-navbar`, `docs/legacybridge-readme`.

## 4. Controllare le modifiche prima del commit

```bash
git status --short
git diff --check
git diff --stat
git diff
```

Per il portfolio pubblico:

```bash
npm test
python3 scripts/build_pages.py
python3 scripts/audit_portfolio.py
```

Per una modifica a un altro progetto usa i test **specifici** di quel repository; i comandi sopra non certificano automaticamente ogni app.

**Non fare `git add .` alla cieca**, soprattutto se nella cartella ci sono token, `.env`, file personali o immagini private. Aggiungi solo i percorsi effettivamente richiesti:

```bash
git add portfolio/index.html portfolio/assets/site.css
git diff --cached --stat
git diff --cached --check
git diff --cached
```

L'esempio sopra riguarda una modifica HTML+CSS: sostituisci i percorsi con i file realmente modificati. Il generato `_site/` non deve essere aggiunto.

## 5. Scrivere un messaggio che racconti davvero la modifica

Adottiamo la convenzione [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<tipo>(<area>): <azione breve e precisa>
```

- `feat(portfolio): add official Sapri school emblem` — una nuova funzionalità o contenuto.
- `fix(portfolio): correct mobile navigation focus` — corregge un errore.
- `docs(legacybridge): document HP 550 CPU compatibility` — documentazione.
- `test(forma-ai): cover atlas gender switch` — test.
- `refactor(signalscope): simplify HTML extraction` — refactoring senza modificare comportamento esterno.
- `chore(repo): ignore generated build artifacts` — manutenzione.

Il messaggio descrive ciò che è **stato fatto**, non ciò che speriamo di fare. Un commit non deve mischiare correzioni scollegate solo per essere più grande.

```bash
git commit -m "fix(portfolio): correct mobile navigation focus"
git push -u origin feat/descrizione-breve
```

Scegli un **nome branch coerente con il messaggio**: nell'esempio andrebbe `fix/mobile-navigation-focus`.

## 6. Aprire e unire la Pull Request

```bash
gh pr create --base main --head feat/descrizione-breve \
  --title "feat(portfolio): describe the change" \
  --body "Changes: ...; Tests: npm test and portfolio audit."
```

Apri la PR su GitHub e controlla **Files changed** e **Checks**. Esegui il merge solo dopo il successo dei test e dopo aver verificato che i file staged sono corretti.

```bash
gh pr merge --squash --delete-branch
git switch main
git pull --ff-only origin main
git status -sb
```

Non usare `git push --force` su `main`; non usare `git reset --hard` o `git clean -fd` senza comprendere che cosa stai cancellando.

## 7. Pubblicare le Patch Notes

Una volta verificata e pubblicata la modifica, aggiungi una voce IT/EN in `scripts/project_updates.json`, usando `scripts/README_RELEASE_NOTES.md` come schema. Idealmente la nota accompagna il codice nella **stessa PR**, purché descriva solo cambiamenti già implementati e testati.

## 8. Separare correttamente i repository

Al 13 novembre 2026, il repository pubblico `forma-ai` serve ancora il portfolio ufficiale. **Non rinominarlo e non spostare il dominio ora**. La migrazione di `portfolio` e `LegacyBridge` deve seguire [la checklist di trasferimento](GITHUB_REPOSITORY_REORGANIZATION.md) e richiede prima la creazione dei nuovi repository.

Evita di copiare la vecchia cronologia Git completa nel nuovo repository senza un controllo di dati privati, licenze e commit storici. Non pubblicare contenuto di `forma-ai-private`.

## Esempio reale

La [PR #8](https://github.com/GiovanniDelGaudio1994/forma-ai/pull/8) ha inserito il logo scolastico fornito per Sapri, con testi IT/EN, CSS, verifica automatica e changelog in **un solo commit** su branch dedicato. Dopo il successo della CI è stata unita con `Squash and merge`.

### English quick reference

Use a short-lived feature branch, write a focused commit with a clear `type(scope): description`, run tests, stage only intended files, push and open a Pull Request. Review the diff and CI status, then squash-merge. Keep secrets/private sources out of public repositories.
