# SignalScope — Responsible Web Change Monitor

**Progetto personale · Python 3 · SQLite · Web scraping responsabile**

SignalScope è un prototipo CLI che analizza il contenuto testuale di pagine web pubbliche, calcola l'impronta SHA-256 e memorizza in SQLite soltanto le versioni modificate. Quando trova differenze, genera un *unified diff* esportabile in JSON. È pensato come base per il monitoraggio trasparente di pagine informative, avvisi e comunicazioni pubbliche.

## Avvio (Python 3.10+, nessuna dipendenza esterna)

```bash
python3 source/signalscope.py check https://example.org/
python3 source/signalscope.py history https://example.org/
python3 -m unittest discover -s tests -v
```

Il file SQLite locale viene creato nella cartella corrente. Per cronologie separate usa `--db ./mio-monitor.sqlite3`.

## Funzionalità implementate
- Controllo di `robots.txt` prima di ogni richiesta al documento
- Limitazione a HTTP(S), porte standard e host pubblicamente instradabili
- Limite di dimensione (1 MB), timeout (15 secondi), blocco dei redirect cross-host
- Estrazione del testo HTML ignorando script, style, noscript e SVG
- Impronte SHA-256, versionamento incrementale su SQLite e differenze leggibili
- Output JSON utilizzabile da script e pipeline

## Limiti e roadmap
**Prototipo: non è un servizio cloud né un monitor automatico.** Richiede esecuzioni manuali o uno scheduler esterno; il supporto JavaScript, CSS selector, feed RSS, notifiche, statistiche e dashboard sono obiettivi futuri. Le pagine protette da login e i siti che negano l'accesso non sono supportati. Non esegue scraping massivo, bypass CAPTCHA, scraping di dati personali né aggira le regole dei siti. Il controllo DNS riduce i rischi di SSRF ma non è un isolamento di rete completo: per un servizio multiutente è richiesto anche un egress proxy con verifica degli IP di destinazione.

### Note sul mercato
Esistono già prodotti di monitoring generico come changedetection.io. L'obiettivo è quindi distinguersi per tracciabilità, approccio trasparente e analisi delle fonti, non rivendicare una novità assoluta.

## Autore
Giovanni Del Gaudio · [Portfolio](https://giovannidelgaudio1994.github.io/forma-ai/portfolio/).
