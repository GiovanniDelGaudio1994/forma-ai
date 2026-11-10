# FORMA AI — Pubblicazione su GitHub

Repository proposto: **GiovanniDelGaudio1994/forma-ai**  
URL previsto per l'app, *solo dopo la pubblicazione*: `https://giovannidelgaudio1994.github.io/forma-ai/`

> Importante: il sito su GitHub Pages usa le funzioni offline. Il coach generativo necessita di un backend Node separato e di una chiave API **solo sul server**. Non inserire mai `.env`, dati sanitari, backup JSON o foto nel repository pubblico.

## Metodo con interfaccia GitHub

1. Accedi a [github.com/new](https://github.com/new) con `GiovanniDelGaudio1994`.
2. Crea un repository pubblico chiamato `forma-ai`, senza README/license iniziali (sono già nel progetto).
3. Carica **tutti i file e cartelle** dell'archivio, mantenendo `.github/workflows/deploy.yml`. Se l'interfaccia non carica le cartelle nascoste, usa il metodo Git qui sotto.
4. Apri `Settings` → `Pages` → `Build and deployment`, seleziona **GitHub Actions**.
5. Controlla la scheda `Actions`: dopo il deploy il sito sarà all'URL sopra.

## Metodo Git dal Terminale Mac (consigliato)

Installa Git se non lo hai già. Apri Terminale nella cartella `forma-ai` estratta e lancia:

```bash
npm test
npm run check
git init
git branch -M main
git add .
git commit -m "feat: initial FORMA AI PWA"
git remote add origin https://github.com/GiovanniDelGaudio1994/forma-ai.git
git push -u origin main
```

Il repository `forma-ai` deve essere creato prima con GitHub. Per autenticarti al `git push` usa GitHub CLI o Git Credential Manager: la normale password GitHub non funziona per i push HTTPS. Se hai un repository già inizializzato, salta `git init` e verifica il remote con `git remote -v`.

## Avvio sul Mac

```bash
cd forma-ai
npm start
```

Apri `http://127.0.0.1:8787`; per usare il coach reale copia `.env.example` in `.env` e configura `OPENAI_API_KEY` **senza mai effettuare un commit di `.env`**. Il piano locale non richiede API o costi.

## Checklist per un repository portfolio

- [ ] Nessuna chiave API, backup o foto personale nel repository
- [ ] README con immagine di anteprima e descrizione delle funzionalità
- [ ] Test CI superati
- [ ] GitHub Pages attivo
- [ ] Backend AI segnato come componente opzionale non incluso nel deploy statico
