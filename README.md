# aria2 Launcher

A visual configuration launcher for the aria2 command-line downloader. Configure aria2 options through a graphical interface, then copy the final command to the clipboard or run it directly in a terminal.

The bundled aria2 binary is version **1.37.0**. To rebuild against the newest aria2 source, follow [`AGENTS.md`](AGENTS.md) — **this project may only be compiled and packaged by an AI Agent**.

## Features

- Two prominent required fields: the aria2 executable path (auto-filled with the bundled binary) and the download source address.
- Six categorized tabs with 49 commonly used parameters, using four control types: checkbox, textbox, radio button, and grouped radio buttons for mutually exclusive options.
- Parameters are emitted only when their checkbox is enabled. The command preview updates in real time, and paths and special characters are quoted correctly for PowerShell.
- Ships with `bin/aria2c.exe` (aria2 1.37.0), consistent with the reference `aria2.zip` archive — ready to use out of the box.
- Cross-platform terminal execution: PowerShell on Windows (with `-NoExit` to keep the window open), and the system terminal on macOS/Linux.
- Bundled under the **GPL-2.0** license, matching aria2 itself (see [`LICENSE`](LICENSE)).

## Running

### Option 1 — Prebuilt executable (recommended)

From the `dist/` directory:

- **`aria2启动器 1.0.0.exe`** — portable build; double-click to run, no installation required, and it can be copied to any Windows machine.
- **`aria2启动器 Setup 1.0.0.exe`** — NSIS installer; lets you choose the install location and create desktop/Start-menu shortcuts.

Both include aria2 1.37.0, so neither Node.js nor a separate aria2 installation is needed.

### Option 2 — Run from source

Requires Node.js 18+.

```bash
npm install
npm start
```

On Windows you can also double-click `启动.bat`.

### Rebuilding

Rebuilding against the latest aria2 source must be done by an AI Agent following `AGENTS.md`. Once the parameter set is settled, the application build itself is:

```bash
npm run dist
```

Artifacts are written to `dist/`. The first build downloads the electron-builder runtime (~3 minutes).

## Project layout

- `main.js` — Electron main process: file dialog, clipboard, and cross-platform terminal execution.
- `preload.js` — IPC bridge with context isolation enabled and only a whitelist of APIs exposed.
- `index.html` — Renderer: UI, parameter definitions, command generation, and preview.
- `bin/aria2c.exe` — aria2 1.37.0 from the reference archive; unpacked to `app.asar.unpacked/bin/` at packaging time so it can be executed.
- `AGENTS.md` — Mandatory AI-Agent-only build and packaging procedure.
- `LICENSE` — GNU General Public License v2.0.

## Behavior notes

- **Copy** copies the final command in PowerShell syntax.
- **Run in terminal** opens a new terminal window, executes the command, and keeps the window open so download progress remains visible.
- To use a different aria2 build, click **Browse...** and select your own `aria2c.exe`.
- For parameters not exposed in the UI, the generated command can be fine-tuned manually before running.

## Security

The renderer runs with Node integration disabled and only a whitelist of IPC channels exposed through `preload.js`. Terminal execution passes the command via PowerShell `-EncodedCommand` to avoid quoting/injection issues.
