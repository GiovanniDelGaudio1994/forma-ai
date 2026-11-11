# Fit Zone — Registro modifiche demo

## 2026-11-11 — `fix(fit-zone): allinea il frontend alla copertina del portfolio`

**Problema.** La copertina approvata mostrava un sito Fit Zone con header antracite, accent color arancione, hero fotografico «La tua palestra, sempre con te», tre corsi in evidenza e catalogo smartphone. La precedente anteprima originale non aveva ancora questa impaginazione e risultava poco coerente con il materiale promozionale.

**Correzioni.**

- Restyling della homepage con navigazione scura/arancione, hero fotografico basato sull'asset originale `header`, CTA per esplorare i corsi e prime schede Spinning, HIIT e Functional Training.
- Catalogo corsi con sette attività **verificate nello schema MySQL originale** e immagini già usate dal progetto, filtri Cardio / Functional / Benessere, card responsive per smartphone.
- Responsive design con menu hamburger accessibile, leggibilità mobile e navigazione da tastiera; nuove regole CSS isolate per non alterare le altre pagine dell'anteprima.
- Note di trasparenza: la demo resta statica, non simula operazioni server completate e non invia dati dei moduli.
- Conservate senza modifiche le altre sezioni e gli altri percorsi statici (abbonamenti, calendario, profilo, prenotazioni e login).

**Verifica locale.** Chromium 1440×900 / 390×844 / 320×660; menu aperto/chiuso; filtri 7 → 3 Cardio → 2 Functional → 2 Benessere; invio contatti simulato; console senza errori JS; nessuno scroll orizzontale rilevato.

**Limiti noti.** La copertina è un render illustrativo, quindi non contiene screenshot pixel-identici del prodotto. Il PHP/MySQL non è eseguito da GitHub Pages; l'implementazione server originale revisionata rimane nel repository portfolio e verrà aggiornata separatamente quando sarà pronta la relativa branch di sviluppo.
