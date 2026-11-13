# Portfolio & Project Quality Audit — 13 November 2026

Status: **initial repository-level review, not a runtime certification**. This report distinguishes verified public artifacts from planned features, local code and tests not yet performed. Language: IT / EN summary.

## Risultati verificati e priorità

| Priorità | Area | Risultato osservato | Prossimo miglioramento concreto |
|---|---|---|---|
| P0 | Portfolio / GitHub | Il sito è pubblicato tramite `forma-ai`, che ospita anche altre demo. Le verifiche GitHub Pages e lo script audit sono presenti. | Separare il repository `portfolio` senza interrompere il dominio, dare a LegacyBridge una repo propria, poi aggiornare tutti i link. |
| P0 | Navbar IT/EN | Nuove voci con icone, menu mobile e cambio tema/lingua pubblicati in sorgente, con CI di sintassi. | Test visivo e accessibilità su Safari, Firefox, Chrome, iPhone e tablet; valutare layout 320–1280 px. |
| P0 | Formazione | La pagina mostra UNISA e il diploma Geometra 2014/15 di Sapri. Il simbolo scolastico attuale è **illustrativo, non il logo ufficiale**. | Sostituirlo solo dopo aver ricevuto il **file ufficiale PNG/SVG** dalla persona titolare, verificando provenienza e resa su fondo chiaro/scuro. |
| P1 | FORMA AI | Demo pubblica separata dalla versione applicativa privata. Atlante illustrativo 3D uomo/donna e Neon Edition sono documentati nella cronologia commit. | Allineare le descrizioni fra demo e codice realmente operativo; test responsive e accessibilità; proteggere backend, dati di salute e immagini utenti. |
| P1 | LegacyBridge | Pubblicata una piccola sonda PowerShell read-only AGPLv3, una demo e il caso studio HP 550. | Rilevare CPUID sul PC reale, avviare Linux Live senza scrivere sul disco, e documentare esito e limiti. Capacità fisica SSD ancora da verificare in sicurezza. |
| P1 | Fit Zone | Demo pubblica, sorgente PHP consultabile e interventi responsive v1.1 nei commit. | Audit separato del codice PHP: validazione input, query parametrizzate, gestione sessioni, accessibilità e test sulle interazioni. La demo con dati sintetici non prova la sicurezza del backend reale. |
| P1 | SignalScope | Motore CLI Python pubblico con regole spiegabili, snapshot e test di regressione citati nei commit. | Verificare fixtures e failure modes, limiti di frequenza, licenze/robots delle fonti e output anonimi; non presentarlo come classificatore AI. |
| P2 | Meteo Bash 2D | Client terminale Bash/Open-Meteo e demo web; intervento di compatibilità Bash 3.2 su macOS. | Test di connettività, timeout, offline, error handling, accessibilità del terminale web e riferimenti a software di terzi. |
| P2 | e-Wine | Demo universitaria navigabile, catalogo e ruoli simulati; sorgenti Java/JSP storici non pubblicati. | Verificare i link alle immagini originali, il layout mobile e la chiarezza del carattere dimostrativo. |
| P2 | GestioneFarmacia | Demo pubblica che riprende l'interfaccia Java Swing con dati sintetici. | Test delle schermate e documentazione UML/architettura dell'app originale senza diffondere dati privati. |
| P2 | RememberMe / iRem | Mockup del prototipo IUM navigabili dal portfolio. | Aggiungere report di usability testing, obiettivi di progetto, risultati e materiale accessibile; non chiamarlo applicazione già distribuita. |
| Non verificato | DriveGlass | Portfolio e documentazione di un companion vehicle in sviluppo; codice completo non disponibile nei repository pubblici verificati. | Per una code review reale servono repository o ZIP aggiornato; eseguire `flutter analyze`, test widget, build desktop/mobile, audit dipendenze e gestione dei dati veicolo. Non dichiarare backend pronto solo dalla demo. |

## Checklist di qualità valida per ogni progetto

- [ ] README separato con obiettivo, funzionalità implementate vs previste, stack e screenshot propri
- [ ] LICENSE e `THIRD_PARTY_NOTICES` coerenti con il codice *effettivamente* distribuito
- [ ] CI di sintassi, unit test e smoke test delle demo per il linguaggio appropriato
- [ ] Collegamenti funzionanti da portfolio, GitHub e changelog
- [ ] Nessun segreto, documento privato o dato reale negli esempi pubblici
- [ ] Mobile, tastiera, focus visibile, contrasto, alt text e reduced motion
- [ ] Misure riproducibili: build riuscita, copertura dei test dove utile, metrica Lighthouse **solo se realmente misurata**
- [ ] Release notes datate con link ai commit; nessuna versione o funzionalità inventata
- [ ] Contenuti principali IT/EN e tag SEO corretti per le pagine indicizzabili

## Sequenza operativa

1. **Stabilizzare portfolio e navbar**; acquisire logo scolastico ufficiale dal proprietario.
2. **Preparare la separazione delle repository**: `portfolio` e `LegacyBridge`, nuovo build testato, poi cutover del dominio.
3. **Audit FORMA AI**: distinguere mockup pubblico e codice privato, verificare atlante e licenze.
4. **Audit LegacyBridge** con report hardware autentico e prove non invasive.
5. **Audit Fit Zone e SignalScope**: codice già pubblico, verifiche effettive e sicurezza.
6. Meteo Bash, e-Wine, GestioneFarmacia e iRem, poi DriveGlass quando sarà disponibile un export aggiornato.

## EN summary

This is a **preliminary, evidence-based audit**, not a certification. The highest priority is to split the public website and LegacyBridge into separate GitHub repositories without breaking the current Pages domain, validate the redesigned bilingual navigation, and replace the Sapri school placeholder only after obtaining an authentic official logo. Then review each project's actual source, tests, licensing, accessibility and release status.
