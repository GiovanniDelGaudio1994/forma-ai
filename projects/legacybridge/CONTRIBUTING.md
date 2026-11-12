# Contribuire a LegacyBridge · Contributing to LegacyBridge

🇮🇹 **Italiano** · 🇬🇧 English below.

LegacyBridge raccoglie **prove riproducibili** di compatibilità hardware su computer legacy. Il laboratorio è sperimentale e non garantisce il funzionamento di Windows 11 su CPU non supportate.

## Come inviare un report (IT)

Apri una issue pubblica nel repository descrivendo, con dati anonimizzati:

- Marca e modello del computer, anno approssimativo.
- Modello della CPU, RAM e tipo di firmware (BIOS/UEFI).
- Sistema operativo e versione/build **realmente avviati**.
- Istruzioni CPU rilevate: SSE2, SSE4.2, POPCNT (indica lo strumento usato).
- Test effettuati (Linux Live, boot da USB, driver, prestazioni), esito e passaggi per riprodurli.
- Problemi conosciuti e stato del backup prima di prove che potrebbero alterare dati.

**Non pubblicare:** username, numero di serie, UUID, indirizzi MAC/IP, chiavi di licenza, dati privati, schermate con identificatori, firmware proprietario, ISO Windows, DLL o file Microsoft modificati.

Un valore `OK` per lo stato di un disco o una capacità dichiarata non ne dimostrano affidabilità né capacità effettiva. Non eseguire test di scrittura invasivi su dischi che contengono dati importanti.

Usa tre categorie esplicite: **osservato**, **inferito dalle specifiche**, **ancora da verificare**. Non presentare mai un test pianificato come un risultato ottenuto.

## Contributing a hardware report (EN)

Open a public issue with an anonymized, reproducible report:

- Manufacturer, model, approximate year, CPU, RAM and firmware type.
- Exact operating system version that **actually booted**.
- CPU instruction flags (SSE2, SSE4.2, POPCNT), and how you measured them.
- Steps, observed outcome, error messages and driver/performance limitations.
- State whether a backup exists before potentially destructive testing.

**Never share:** serial numbers, usernames, UUIDs, IP/MAC addresses, activation keys, personal data, proprietary firmware, Windows ISOs or modified Microsoft binaries.

Label every statement **observed**, **inferred from specifications**, or **not yet verified**. Installation bypasses cannot implement missing hardware instructions.

## License

Original public code is licensed under [GNU AGPL-3.0-only](LICENSE). Submitted original code contributions should use the same license. Retain author attribution and third-party notices. Documentation is shared for reproducibility; do not submit copyrighted proprietary binaries.

The project is independent and not affiliated with Microsoft, Intel or HP.
