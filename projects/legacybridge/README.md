# LegacyBridge — Hardware Compatibility Lab

**Old hardware. New possibilities.** Ricerca e diagnostica responsabile sui computer legacy.

![Copertina LegacyBridge](../../portfolio/assets/projects/legacybridge-cover.svg)

## Case study #001 — HP 550

- **CPU:** Intel Core 2 Duo T5670 · 1,80 GHz · capacità Intel 64 confermata
- **OS osservato:** Windows 10 Pro 1909, **32 bit**, avviato correttamente
- **RAM riportata:** circa 3 GiB
- **Firmware:** BIOS Legacy
- **Unità SATA:** modello dichiarato `SSD 4TB`; **capacità fisica non verificata**
- **Linux Live x64:** ancora da provare
- **Windows 11:** non testato, **non certificato compatibile**; il bypass dei requisiti non fornisce istruzioni CPU mancanti.

Questo repository pubblico contiene **solo una piccola sonda di diagnostica read-only** e documentazione; il progetto sperimentale completo rimane separato.

### Esecuzione (Windows PowerShell)

Salva `probe_windows_readonly.ps1` sul computer di test, leggi il sorgente, quindi esegui con PowerShell 5.1:

```powershell
powershell.exe -NoProfile -File .\probe_windows_readonly.ps1
```

Non necessita amministratore; stampa JSON in console e **non** cambia firmware, disco o partizioni. Per verificare POPCNT/SSE4.2 occorre un vero CPUID (non basta WMI). Non pubblicare log personali o identificatori.

### Demo e percorso

- [Demo pubblica LegacyBridge](https://giovannidelgaudio.it/legacybridge-demo/)
- [Sito portfolio](https://giovannidelgaudio.it/)
- Step successivo: creare backup, avviare antiX Live x64 da USB, leggere CPUID e controllare la salute del supporto senza scriverci dati.

### Licenza e attribuzioni

Copyright © 2026 Giovanni Del Gaudio. Il codice qui pubblicato è sotto **GNU AGPLv3 only**; leggi [LICENSE](./LICENSE). AGPL consente copia, modifica e distribuzione rispettando condizioni, copyright e obblighi sul sorgente. Non è una licenza che proibisce ogni riuso. Il logo/nome possono essere gestiti separatamente.

Progetto indipendente, **non affiliato** a HP, Intel o Microsoft. Nessun file Windows, patch del kernel, ISO o codice di terzi è distribuito qui.
