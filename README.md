# Sentinel Terminal

Sentinel Terminal is a Bloomberg-style intelligence and markets web terminal built with:

- Java 8 only on the backend, using the JDK's built-in `HttpServer`
- Vanilla HTML, CSS, and JavaScript on the frontend
- MapLibre GL JS for a globe-style live map
- A browser `Worker` for local threat analysis so headline scoring stays on the client

## What is included

- 40+ intelligence layers covering conflicts, cyber, maritime, satellite, supply-chain, and disaster signals
- 1,200 simulated live markers distributed across global hubs
- A terminal command bar with `HELP`, `STATUS`, `LAYER <id>`, `WATCH <symbol>`, and `REGION <name>`
- A live feed panel, regional load panel, and markets pulse cards
- A globe visualization designed around raw DOM updates and fast `GeoJSON` source refreshes

## What is not included yet

This repository ships a credible architecture and working UI, not a production feed ingestion stack. The current backend uses simulated data so you can validate the terminal experience first.

To turn it into a real system, swap the generator in `src/com/anton/terminal/service/TerminalDataService.java` with adapters for:

- RSS and news ingest
- Telegram OSINT collection
- ADS-B and AIS providers
- NASA FIRMS or other fire satellite feeds
- USGS or EMSC earthquake feeds
- Cyber threat intelligence APIs

The browser worker in `web/assets/threat-worker.js` is a local classifier stub. You can replace that worker implementation with Transformers.js or ONNX Runtime Web if you want heavier local inference.

## Run

From PowerShell:

```powershell
.\run.ps1
```

From `cmd.exe`:

```bat
run.bat
```

Then open [http://localhost:8080](http://localhost:8080).

## Requirements

- JDK 17 or newer installed
- `java` and `javac` available on your `PATH`

The local workspace used during development may contain a private `.tools/` JDK, and `run.ps1` will use it automatically if present. That directory is not committed to GitHub.

## Layout

- `src/com/anton/terminal/Main.java`: HTTP server, API routes, and static file serving
- `src/com/anton/terminal/service/TerminalDataService.java`: data model generation, refresh loop, and command handling
- `web/index.html`: terminal shell
- `web/assets/app.js`: map, polling, DOM rendering, and command UI
- `web/assets/threat-worker.js`: local browser-side analysis
