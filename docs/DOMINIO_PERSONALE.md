# Dominio del portfolio — giovannidelgaudio.it

**Stato:** sito GitHub Pages pronto; attivazione del dominio in GitHub Pages e impostazioni DNS IONOS ancora da completare.

## Pagine pubblicate

| Percorso sul nuovo dominio | Destinazione |
| --- | --- |
| `https://giovannidelgaudio.it/` | Portfolio personale |
| `/forma-ai-demo/` | FORMA AI, demo pubblica |
| `/atlante-3d.html` | Atlante 3D FORMA AI |
| `/ewine-demo/` | e-Wine, demo frontend con sorgenti originali privati |
| `/fit-zone-demo/` | Fit Zone |
| `/gestione-farmacia-demo/` | GestioneFarmacia |
| `/meteo-bash2d-demo/` | Meteo Bash 2D |
| `/signalscope-demo/` | SignalScope |

La homepage è generata da `portfolio/index.html` tramite `scripts/build_pages.py`. Il codice originale FORMA AI della demo pubblica rimane nel file sorgente `index.html` del repository, mentre la build lo serve anche sotto `/forma-ai-demo/`. La pipeline di deploy è `.github/workflows/pages.yml`.

## 1. GitHub Pages — dominio personalizzato

Aprire [Settings → Pages](https://github.com/GiovanniDelGaudio1994/forma-ai/settings/pages) e inserire nel campo **Custom domain**:

```text
giovannidelgaudio.it
```

Quindi premere **Save**.

**Nota:** il sito usa GitHub Actions per pubblicare. In questa modalità un file `CNAME` aggiunto al repository non configura automaticamente il dominio: va impostato in Settings → Pages oppure tramite l'API GitHub Pages con permessi amministrativi.

Per chi ha già eseguito `gh auth login` sul Mac, l'alternativa è:

```bash
gh api --method PUT repos/GiovanniDelGaudio1994/forma-ai/pages -f cname=giovannidelgaudio.it
```

Se questa chiamata fallisce, usare la pagina Settings → Pages.

## 2. IONOS — record DNS

In IONOS aprire **Domini & SSL → giovannidelgaudio.it → DNS → Aggiungi record**.

Se i record A predefiniti `@` puntano alla pagina di parcheggio IONOS, sostituirli. Non toccare gli MX/TXT utilizzati per email e verifica, né i name server, se non richiesto.

Inserire questi **quattro record A** per il dominio principale (nome host vuoto oppure `@`, secondo la schermata IONOS):

| Tipo | Host | Punta a |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

Aggiungere anche:

| Tipo | Host | Punta a |
| --- | --- | --- |
| CNAME | www | giovannidelgaudio1994.github.io |

Per `www` eliminare prima eventuali record A/AAAA/CNAME in conflitto. Il valore del CNAME non include né `https://` né il nome `/forma-ai`.

**Non utilizzare record wildcard** come `*`. Lasciare TTL predefinito.

## 3. Verifica propagazione

Da Terminale macOS:

```bash
dig +short giovannidelgaudio.it A
dig +short www.giovannidelgaudio.it CNAME
```

Il primo comando deve restituire i quattro IP GitHub Pages. Il secondo deve restituire `giovannidelgaudio1994.github.io.`.

Quando GitHub ha emesso il certificato, tornare in **Settings → Pages** e attivare **Enforce HTTPS**.

DNS e rilascio SSL possono richiedere fino a 24 ore; non confondere una propagazione ancora incompleta con un errore del sito.

## 4. Controlli finali

- `https://giovannidelgaudio.it/` apre il portfolio, non FORMA AI.
- `https://www.giovannidelgaudio.it/` reindirizza al dominio canonico.
- Tutte le demo elencate in questa guida aprono correttamente.
- Il browser mostra HTTPS valido.
- Nessuna immagine, PDF di certificazione o link interno risulta mancante.
- La versione originale `https://giovannidelgaudio1994.github.io/forma-ai/` reindirizza correttamente secondo GitHub Pages.

### Fonti ufficiali

- [GitHub — gestire un dominio personalizzato](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub — REST API Pages](https://docs.github.com/en/rest/pages/pages)
- [IONOS — record A](https://www.ionos.it/aiuto/domini/configurare-un-indirizzo-ip/collegare-un-dominio-a-un-indirizzo-ip-statico/)
- [IONOS — record CNAME](https://www.ionos.it/aiuto/domini/configurare-un-record-cname-per-un-sottodominio/configurare-uno-cname-per-un-sottodominio-gia-esistente/)
