# Fit Zone — Demo frontend del gestionale palestra

[Apri la demo](https://giovannidelgaudio1994.github.io/forma-ai/fit-zone-demo/) · [Codice PHP/MySQL revisionato](https://github.com/GiovanniDelGaudio1994/GiovanniDelGaudio1994/tree/main/projects/fit-zone/source)

Questa cartella contiene la **demo frontend statica** di Fit Zone, derivata dalle funzionalità e dai contenuti del progetto personale PHP/MySQL. La homepage e il catalogo corsi hanno un'interfaccia aggiornata **ispirata alla copertina grafica del portfolio**, con colori arancione/nero, hero fotografico e layout responsive. La copertina rimane un'illustrazione promozionale, non uno screenshot letterale di una versione deployata.

## Cosa si può esplorare

- **Homepage:** navigazione, presentazione della palestra, corsi in evidenza, servizi, galleria, abbonamenti, contatti e FAQ.
- **Catalogo corsi:** sette corsi realmente previsti nello schema del database originale (Yoga, Spinning, Pilates, HIIT, Zumba, CrossFit e Functional Training), con filtri per tipologia e layout mobile.
- **Altre pagine:** abbonamenti, calendario, prenotazioni, profilo e area accesso, disponibili nelle pagine statiche conservate dalla precedente anteprima.
- **Demo contatti:** interazione locale che non invia e non salva dati.

## Limiti della demo e dati

GitHub Pages non esegue PHP o MySQL. **Questa demo non autentica utenti, non gestisce prenotazioni reali, non invia contatti, non processa pagamenti e non conserva informazioni.** Eventuali nomi, orari e disponibilità nelle pagine di anteprima sono dimostrativi. I pulsanti di prenotazione aprono pagine informative statiche: la logica del backend PHP è consultabile separatamente.

Le fotografie provengono dallo ZIP del progetto (ottimizzate in formato WebP); **prima di una pubblicazione commerciale va verificato il diritto di utilizzo e l'eventuale attribuzione**.

## Stack, accessibilità e qualità

HTML5, CSS3 e JavaScript senza framework né servizi esterni. Menu mobile con `aria-expanded`, navigazione da tastiera, link «Salta al contenuto», filtri dei corsi con `aria-pressed`, immagini descrittive, layout adattivo e supporto a `prefers-reduced-motion`.

Controlli locali effettuati con Chromium sulle dimensioni **1440×900, 390×844 e 320×660**: verifica assenza di scroll orizzontale, apertura/chiusura del menu mobile, categorie corsi, invio simulato del modulo e assenza di errori JavaScript.

Consulta [CHANGELOG.md](CHANGELOG.md) per l'elenco delle modifiche e la ragione del fix.
