# AGENTS.md

Instructions for AI coding agents working on **IsideHasher**.

## Project overview

IsideHasher is a small Electron desktop app that computes the hash of a file or a piece of text
(MD4, MD5, RIPEMD160, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512) using Node's built-in `crypto` module.

It is plain JavaScript (CommonJS) with no bundler, no transpiler, no framework and no test suite.
Keep it that way unless the user explicitly asks otherwise.

## Tooling

- **Node.js**: version pinned in `.nvmrc` (minimum supported: 22). Use `nvm use` if available.
- **Package manager**: **Yarn 1.x** (`yarn.lock` is committed). Do **not** use `npm install`
  and do not create a `package-lock.json`.
- **Electron** and **electron-builder** are dev dependencies; `electron-context-menu` is the only
  runtime dependency.

## Commands

| Command        | Purpose                                               |
|----------------|-------------------------------------------------------|
| `yarn install` | Install dependencies (also downloads Electron binary) |
| `yarn start`   | Run the app in development (`electron .`)             |
| `yarn pack`    | Build an unpacked app in `dist/`                      |
| `yarn dist`    | Build installable packages for the current platform   |

There are no lint or test scripts. Verify changes by reading the code carefully and, when a GUI is
available, by running `yarn start`. If the Electron binary is missing, run
`node node_modules/electron/install.js`.

## Architecture

| File          | Role                                                                                  |
|---------------|---------------------------------------------------------------------------------------|
| `main.js`     | Main process: creates the `BrowserWindow`, registers IPC handlers, hashes via `crypto` |
| `preload.js`  | Exposes `window.electron` to the renderer through `contextBridge`                      |
| `renderer.js` | UI logic (IIFE, vanilla DOM APIs) for `index.html`                                     |
| `index.html`  | Window markup; uses Bulma and Font Awesome from CDNs                                   |
| `css/`        | Custom styles                                                                          |
| `icons/`      | App icons and README screenshot                                                        |

Data flow: `renderer.js` → `window.electron.*` (`preload.js`) → `ipcRenderer.sendSync(...)` →
`ipcMain.on(...)` in `main.js` → result returned via `ipcEvent.returnValue`.

IPC channels:

- `compute-file-hash` (`filePath`, `algorithm`) → hex digest
- `compute-text-hash` (`text`, `algorithm`) → hex digest

## Rules and conventions

### Security (Electron)

- Keep `contextIsolation: true`. Never enable `nodeIntegration` or disable `sandbox`/`webSecurity`.
- The renderer must never access Node APIs directly; expose only minimal, purpose-specific
  functions through `contextBridge` in `preload.js`.
- Use `webUtils.getPathForFile()` to obtain file paths (`File.path` was removed in Electron 32).

### IPC

- Handlers currently use **synchronous** IPC (`sendSync` / `ipcEvent.returnValue`). Every code path
  in a sync handler **must** set `ipcEvent.returnValue`, otherwise the renderer hangs. Be careful
  with errors thrown inside async `fs` callbacks.
- When adding a new channel, update all three layers consistently: `ipcMain` handler in `main.js`,
  bridge function in `preload.js`, and caller in `renderer.js`.
- If migrating to async IPC, prefer `ipcMain.handle` / `ipcRenderer.invoke` and update all callers.

### Hash algorithms

- Algorithm identifiers are the `value` attributes of `<select id="hashalgorithm">` in `index.html`
  and are passed straight to `crypto.createHash()`. A new algorithm must be a name supported by
  Electron's `crypto` implementation.
- When adding/removing an algorithm, also update `README.md`, the `description`/`keywords` in
  `package.json`, and the subtitle in `index.html` if relevant.
- Files are hashed in chunks (`CHUNK_SIZE` in `main.js`); do not read whole files into memory.

### Code style

- CommonJS `require` in `main.js` / `preload.js`. ES-module-only packages (e.g.
  `electron-context-menu` v4+) must be loaded with dynamic `import()`.
- 4-space indentation, semicolons, single quotes preferred (match surrounding code).
- Files use **LF** line endings; preserve the line endings of any file you edit.
- Keep the copyright header comment at the top of source files and add it to new source files.
  The project is licensed under **ISC** (see `LICENSE`); headers must say
  "This software is licensed under the ISC license."
- Keep DOM element IDs in `index.html` and `renderer.js` in sync.
- UI uses Bulma classes (e.g. `is-hidden`, `is-primary`); prefer Bulma utilities over custom CSS.

### Dependencies

- Avoid adding dependencies; prefer Node/Electron built-ins.
- When upgrading Electron, check the Electron breaking-changes notes for APIs used here
  (`contextBridge`, `webUtils`, `ipcMain`, `BrowserWindow` options).

### Documentation

- Update `README.md` when changing commands, prerequisites, features or project structure.
- Do not commit `dist/`, `node_modules/` or IDE folders (see `.gitignore`).
