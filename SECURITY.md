# Security & Privacy

- **Non pubblicare chiavi API** in sorgenti, file di configurazione frontend o commit. `.env` è ignorato da Git.
- Il coach remoto può avere costi a consumo. Per deployment pubblico, configura sempre un token privato `COACH_ACCESS_TOKEN`, `ALLOWED_ORIGINS` e HTTPS. CORS non è autenticazione: il token rimane essenziale; occorrono anche eventuali limiti utente e controlli infrastrutturali.
- Il backend rifiuta le origini non autorizzate, limita dimensione richiesta e numero di chiamate per IP, e impedisce la lettura di file server/segreti.
- Le informazioni su condizioni sanitarie sono inviate al backend AI solo durante una richiesta esplicita dell'utente. Le foto non vengono inviate.
- Check e foto non sono sincronizzati: cancellare dati del browser può cancellare definitivamente foto e misure.
- I pasti senza glutine non sono certificati dalla app: AIC raccomanda verifica etichette e prevenzione contaminazione. Le allergie aggiuntive sospendono il menu automatico.
- Per vulnerabilità, aprire una segnalazione privata invece di pubblicare dati personali o chiavi in una issue.

## Versione 0.2 — considerazioni aggiuntive

- I dati di profilo trasmessi al backend AI possono comprendere età, peso, altezza, livello di attività, limitazioni riferite e gli ultimi feedback. L'invio avviene solo quando l'utente aziona una funzione AI, come dichiarato in Impostazioni. Non sono trasmessi foto e video.
- Video Lab: l'utente deve attivare esplicitamente il consenso prima del caricamento del modello MediaPipe via CDN. I frame vengono elaborati sul dispositivo, non inviati al nostro backend. Il download della libreria e le metriche tecniche di terze parti possono comunque comportare trattamento di dati tecnici.
- Lo screening allergeni blocca generazione AI e offline se non completato o se sono dichiarate allergie. È una salvaguardia di prodotto, non una certificazione di sicurezza alimentare.
- Prima di un deployment pubblico che tratti dati di salute, valutare adempimenti privacy applicabili (in particolare GDPR, informativa, basi giuridiche, retention, sicurezza, età degli utenti), revisione da professionisti e gestione del rischio. L'MVP non è una soluzione sanitaria certificata.
