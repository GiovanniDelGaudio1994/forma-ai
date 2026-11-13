# Migrazione sicura del portfolio verso `giovanni-portfolio`

**Stato:** procedura preparata, **repository nuovo e cambio dominio non ancora eseguiti**.

## Obiettivo

Spostare il sito personale, la cronologia degli aggiornamenti bilingue, gli asset e le demo pubbliche in un repository `GiovanniDelGaudio1994/giovanni-portfolio`, mantenendo intatti `giovannidelgaudio.it`, le demo e i repository privati.

Il repository `forma-ai` conserva la propria cronologia Git e le vecchie Pull Request. La nuova repository avrà una cronologia autonoma dedicata al sito: le future PR per il sito dovranno essere aperte lì.

## Vincoli importanti

- Nessun trasferimento del backend o del codice applicativo privato.
- Non eliminare, rendere privato o rinominare `forma-ai` durante la migrazione.
- L'estrazione copia **solo** risorse pubbliche già presenti: `portfolio/`, `assets/`, `scripts/`, i demo pubblici, le pagine sorgenti statiche. Non importa la cartella `projects/`, i test del vecchio progetto o la storia Git completa.
- Il sito nuovo ha workflow GitHub Pages e CI propri.
- Video Full HD e Passaporto digitale DriveGlass sono tra gli asset da verificare.
- Non assegnare lo stesso dominio a due repository contemporaneamente: GitHub Pages supporta un solo assegnatario del dominio.
- La licenza proprietaria del nuovo portfolio riguarda soltanto i contributi originali; non sostituisce le licenze storiche già concesse né quelle dei componenti di terzi.

## Preparazione sul Mac

Scaricare il file `giovanni_portfolio_migrate.sh` fornito nella conversazione, salvarlo in `~/Downloads/` e usare il Terminale.

```bash
gh auth status
bash ~/Downloads/giovanni_portfolio_migrate.sh prepare
```

La modalità `prepare`:

1. Verifica l'account GitHub autenticato e rifiuta di sovrascrivere repository o cartelle esistenti.
2. Clona soltanto il repository **pubblico** `forma-ai`.
3. Copia una allowlist di file del sito in `~/development/giovanni-portfolio`.
4. Esegue `python3 scripts/build_pages.py` e `python3 scripts/audit_portfolio.py` sul sito nuovo.
5. Crea `giovanni-portfolio` pubblico con un `main` iniziale indipendente, evitando di trascinare la storia e il codice degli altri progetti.
6. Configura GitHub Pages con GitHub Actions, senza toccare il dominio in produzione.

Il nuovo repository può essere visualizzato all'indirizzo `https://github.com/GiovanniDelGaudio1994/giovanni-portfolio` **soltanto dopo l'effettiva creazione**. La preview prevista è `https://giovannidelgaudio1994.github.io/giovanni-portfolio/`.

## Verifica della preview

```bash
bash ~/Downloads/giovanni_portfolio_migrate.sh verify
```

Il controllo verifica la pubblicazione della homepage, `/en/`, i principali demo, il video HD e il PDF originale DriveGlass. Controllare visivamente il menu, gli orologi, il tema chiaro/scuro, il changelog e i contenuti mobile prima del cambio dominio.

## Trasferimento del dominio (solo dopo preview verificata)

```bash
bash ~/Downloads/giovanni_portfolio_migrate.sh cutover I-VERIFIED-PREVIEW
```

La modalità `cutover` controlla preventivamente che il vecchio Pages detenga ancora il dominio, rimuove l'assegnazione dal vecchio repository e la imposta sul nuovo. In caso di errore nell'assegnazione nuova tenta di ripristinare il dominio precedente. Una breve interruzione o la preparazione del certificato HTTPS possono comunque verificarsi; quindi **non dichiarare il cambio completato senza verificare il dominio**.

Se fosse necessario tornare al precedente repository:

```bash
bash ~/Downloads/giovanni_portfolio_migrate.sh rollback
```

## Dopo la migrazione

- Usare `giovanni-portfolio` per modifiche al sito, navbar, changelog e GitHub Pages.
- Tenere `forma-ai` per le proprie demo e il progetto FORMA AI, separando gradualmente i duplicati solo dopo il passaggio completato.
- Conservare la storia delle PR precedenti in `forma-ai`; non è necessario cancellarle.
- Rivalutare i link nelle README e nelle schede progetto soltanto dopo aver verificato che il nuovo repository sia effettivamente online.
- Conservare invariati i repository privati.

## Riferimenti ufficiali

- [GitHub CLI — creare un repository dall'origine locale](https://cli.github.com/manual/gh_repo_create)
- [GitHub Pages — personalizzare il dominio](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub REST — Pages](https://docs.github.com/en/rest/pages/pages)
