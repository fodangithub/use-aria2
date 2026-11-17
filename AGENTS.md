# AGENTS.md

## Scope

This repository is a visual configuration launcher for the aria2 command-line downloader.

**This project may only be compiled and packaged by an AI Agent.** Manual compilation by a human is not supported and must not be attempted. Every build must follow the procedure below, in order. The AI Agent is responsible for making decisions at each step and for asking the user only when this document explicitly requires it.

## Build procedure

### Step 1 — Obtain the latest aria2 source

Clone the latest aria2 source from the official repository using git:

```bash
git clone https://github.com/aria2/aria2.git
```

- Always fetch the newest revision; do not reuse a cached or older checkout.
- If the clone fails for any reason (network error, timeout, DNS, TLS, connection reset), **do not silently retry forever and do not substitute a prebuilt binary**. Instead, use the Ask tool to request proxy configuration from the user:
  - Ask for the proxy type and address, for example `http://127.0.0.1:7890` or `socks5://127.0.0.1:1080`.
  - Ask whether the proxy needs a username and password.
  - Apply the supplied proxy to the git operation (for example via `git -c http.proxy=... -c https.proxy=...`) and retry the clone.
  - If the user cannot provide a working proxy, stop and report the blocker clearly.

Record the exact commit hash of the revision that was cloned, and report it to the user.

### Step 2 — Compile aria2

Build aria2 from the freshly cloned source for the current platform.

- Follow the official aria2 build instructions for the host operating system.
- Enable the commonly used features (HTTP/HTTPS, FTP, BitTorrent, Metalink) so the launcher's parameter set remains meaningful.
- Verify the build by running `aria2c --version` and confirm it reports the newly built version. Keep the resulting `aria2c` (or `aria2c.exe`) binary path handy — it is used in Step 5.

### Step 3 — Align the exposed parameters with the newly built aria2

Compare the command-line options exposed by the newly compiled aria2 against the parameters currently declared in the launcher UI (`index.html`).

Obtain the authoritative option list from the binary itself:

```bash
aria2c --help=#all
```

Then decide:

- **Step 3.1 — No change needed.** If the available parameters changed only marginally and ordinary download usage is unaffected (no option relevant to general downloading was added, removed, or renamed), leave the code unchanged. State briefly which differences you found and why no adjustment was required.
- **Step 3.2 — Ask the user.** If parameters did change in a way that affects general downloading (relevant options added, removed, renamed, or value semantics changed), you **must** use the Ask tool to ask the user how to proceed before changing code. Present the concrete differences and propose how to update the parameter declarations.

**Language rule for Step 3.2:** always ask the user in the user's system language. Detect the system language from the environment (for example `LANG`, `LC_ALL`, or the operating system locale). If you do not have permission to read the system language, or it cannot be determined reliably, default to **English**.

### Step 4 — Compile the launcher code

After the parameter set is settled, compile/build the launcher itself:

```bash
npm install
npm run dist
```

Fix any build errors before proceeding. Do not ship a build that failed to compile.

### Step 5 — Package and install locally

Package the application so it can be executed directly on the local machine, then install/place it where the user can run it immediately.

- Produce a directly runnable artifact:
  - **Windows:** a portable `.exe` and/or an NSIS installer under `dist/`.
  - **Linux:** a runnable AppImage, `.deb`, or a packaged directory with a launcher script.
  - Make sure the package bundles (or can locate) the aria2 binary built in Step 2.
- Set the **default aria2 executable path** in the application to the binary compiled in Step 2 — not to a placeholder and not to an old bundled version.
- Set the **default download directory** to the current user's Downloads folder:
  - **Windows:** `%USERPROFILE%\Downloads`
  - **Linux:** `$HOME/Downloads` (fall back to `$XDG_DOWNLOAD_DIR` when set)
  - **macOS:** `$HOME/Downloads`
  - Be aware that the exact location differs between Windows and Linux (and macOS). Resolve it at runtime from the environment rather than hard-coding one platform's path.
- Launch the packaged result once to confirm it starts correctly, and report the outcome.

## Reporting

At the end of a build, report to the user:

1. The cloned aria2 commit hash and compiled aria2 version.
2. Whether Step 3.1 or Step 3.2 applied, and what was decided.
3. The path to the packaged artifact and confirmation that it launches.
4. The default aria2 path and default download directory that were configured.
