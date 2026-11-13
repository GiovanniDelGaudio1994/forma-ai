# Piano di separazione dei repository GitHub

> **Aggiornamento 13/11/2026:** questa è la pianificazione storica. La migrazione effettiva si esegue con la nuova [procedura controllata per `giovanni-portfolio`](PORTFOLIO_MIGRATION_RUNBOOK.md), che non ha ancora trasferito il dominio. **LegacyBridge è ora destinato a sviluppo proprietario**: nessun nuovo repository pubblico LegacyBridge è previsto dalla procedura. La sonda PowerShell precedentemente pubblicata rimane AGPLv3.

**Obiettivo:** dare a ogni progetto una propria identità GitHub senza interrompere la pubblicazione di `https://giovannidelgaudio.it`. This document is also usable by international contributors.

## Situazione verificata al 13 novembre 2026

| Repository | Visibilità | Funzione attuale |
|---|---|---|
| `GiovanniDelGaudio1994/GiovanniDelGaudio1994` | Pubblico | Profilo GitHub |
| `GiovanniDelGaudio1994/forma-ai` | Pubblico | Demo FORMA AI **e sito portfolio**; contiene anche altre demo pubbliche |
| `GiovanniDelGaudio1994/forma-ai-private` | Privato | Sviluppo riservato FORMA AI |
| `GiovanniDelGaudio1994/GestioneFarmacia` | Privato | Sorgenti non pubblici |

I nuovi repository `portfolio` e `LegacyBridge` **non sono ancora stati creati**. Non rinominare `forma-ai` ora: il dominio pubblico e la CI dipendono da esso.

## Architettura di destinazione

```text
GiovanniDelGaudio1994/
  GiovanniDelGaudio1994    # homepage profilo GitHub
  portfolio                # NUOVO, pubblico: sito principale + demo statiche
  LegacyBridge             # NUOVO, pubblico: public probe, AGPLv3, report e documentazione
  forma-ai                 # pubblico: SOLO presentazione FORMA AI e demo in futuro
  forma-ai-private         # privato: codice e backend FORMA AI
  GestioneFarmacia         # privato: non modificare
```

La barra in alto su GitHub mostra sempre il **nome del repository** corrente. Solo quando `LegacyBridge` avrà un proprio repository il breadcrumb potrà essere `GiovanniDelGaudio1994 / LegacyBridge`.

## Percorso sicuro in quattro fasi

### Fase 0 — Preparazione (in corso)

- Lasciare GitHub Pages attivo **esattamente dov'è** fino a fine migrazione.
- Inventariare le risorse necessarie al build `scripts/build_pages.py` e le rotte delle demo.
- Preparare il nuovo menu Portfolio in italiano e inglese.
- Controllare che immagini di scuole e istituzioni siano autentiche o esplicitamente provvisorie.
- Eseguire `npm test`, `python3 scripts/build_pages.py` e `python3 scripts/audit_portfolio.py`.

### Fase 1 — Creare i due repository vuoti (richiede il proprietario)

Creare dall'interfaccia GitHub, impostando **Public**, e **senza inizializzare** README/licenza/README automatici (li copieremo in modo controllato):

1. `portfolio` — descrizione: `Bilingual developer portfolio, public demos and verifiable project release notes`.
2. `LegacyBridge` — descrizione: `Legacy Hardware Compatibility Lab — read-only diagnostics and reproducible research`.

Accertarsi che il collegamento GitHub che usiamo possa operare sui nuovi repository; una nuova creazione potrebbe richiedere di aggiornare i permessi del connettore.

### Fase 2 — Migrazione controllata di LegacyBridge

Spostare **solo file già pubblici e revisionati**:

- `projects/legacybridge/README.md` e `README.en.md` → root del nuovo repository.
- `projects/legacybridge/probe_windows_readonly.ps1` → `probe_windows_readonly.ps1`.
- `projects/legacybridge/LICENSE` → `LICENSE` (GNU AGPL-3.0-only).
- `projects/legacybridge/CONTRIBUTING.md` → `CONTRIBUTING.md`.
- `portfolio/assets/projects/legacybridge-cover.svg` → `assets/legacybridge-cover.svg`, aggiornando i riferimenti delle README.

**Non copiare** il laboratorio privato, binari Microsoft, ISO, patch sperimentali non verificate o cartelle `private`. La demo web bilingue può restare ospitata nel portfolio pubblico, con link dal nuovo repository.

Verificare testo della licenza, link delle immagini, README, collegamenti al caso studio HP 550 e riferimenti dal profilo GitHub. Non cancellare ancora le vecchie copie.

### Fase 3 — Migrazione controllata del sito

La cartella `portfolio/` non è sufficiente da sola: l'attuale build pubblica anche le demo statiche, `assets`, `scripts`, `privacy.html`, `atlante-3d.html` e una copia trasformata della demo FORMA AI. **Inventariare tutte le dipendenze** prima di copiare file.

- Preparare un build indipendente nel nuovo `portfolio`; in CI verificare menu, IT/EN, assets, routing demo, SEO, privacy e changelog.
- Pubblicare una **preview** GitHub Pages sul dominio temporaneo del nuovo repository, senza assegnare `giovannidelgaudio.it` in questa fase.
- Confrontare tutte le URL importanti (radice, `/en/`, demo e progetti, `/legacybridge-demo/`, sitemap e robots).
- Solo dopo aver superato i test spostare l'assegnazione del **dominio personalizzato** GitHub Pages dal vecchio al nuovo repository, controllando `CNAME` e DNS. Un solo sito deve detenere il dominio alla volta. Pianificare un rollback.
- Verificare il certificato HTTPS, la sitemap, le risposte HTTP e il caricamento da mobile.
- Aggiornare i README, il profilo GitHub e i collegamenti incrociati.
- Ritirare gradualmente i contenuti duplicati dal vecchio hosting, evitando di rompere URL importanti. La cronologia Git non si cancella automaticamente eliminando file dalla branch.

**Nessun cutover automatico** viene attivato da questa documentazione.

### Fase 4 — Ordinare il resto

L'app completa FORMA AI resta privata. DriveGlass e gli altri progetti potranno avere repository autonomi successivamente, dopo verifica del materiale pubblicabile e delle relative licenze. Gli aggiornamenti locali non vanno dichiarati come rilasci online.

## Criteri di accettazione

- `giovannidelgaudio.it` e `/en/` restano disponibili.
- I nove progetti e tutte le demo visibili continuano a funzionare.
- I due nuovi repository hanno README, licenza corretta, copertina e CI pertinenti.
- Il sito punta al repository effettivo di ogni progetto e GitHub mostra il breadcrumb corretto.
- Nessun codice proprietario o dato personale viene pubblicato per errore.

## English summary

Create separate public `portfolio` and `LegacyBridge` repositories. Keep the current `forma-ai` Pages site serving the production domain until a new, tested deployment is ready. Migrate only already-public source and reviewed assets, preserve private repositories, update cross-links, test bilingual routes, then switch the custom domain with an explicit rollback plan.
