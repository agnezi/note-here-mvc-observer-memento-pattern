# note-here

A desktop text editor built with Electron, React and TypeScript, focused on learning design patterns in a real-world application.

## Features

- Multiple tabs
- Undo / Redo (Cmd+Z / Cmd+Shift+Z)
- Save and Save As (Cmd+S)
- Open files (Cmd+O)
- Word counter and line counter
- Dirty state indicator per tab

## Design Patterns

### MVC — Model / View / Controller

The application is structured around a clear separation of concerns:

| Layer | Role | Location |
|---|---|---|
| **Model** | `EditorDocument` — pure data object representing an open document | `src/renderer/src/models/Document.ts` |
| **View** | React components — render state, dispatch actions | `src/renderer/src/components/` |
| **Controller** | Zustand store — holds state, exposes actions | `src/renderer/src/store/useEditorStore.ts` |

The `EditorDocument` model has no framework dependencies. It is a plain TypeScript interface with a factory function. The store acts as the controller, bridging user interactions from the View to mutations on the Model.

### Observer — via Zustand selectors

Components subscribe to specific slices of state using selectors:

```ts
const content = useEditorStore(state =>
  state.tabs.find(tab => tab.id === state.activeTabId)?.content ?? ''
)
```

Each component only re-renders when the value it selected changes. The `WordCounter` and `LineNumbers` in `StatusBar` react only to `content` changes — they are unaware of tab switching, file saving, or any other state.

This is the Observer pattern: the store is the subject, and each component selector is an observer with a narrow, explicit subscription.

### Memento — undo / redo

Each `EditorDocument` holds its own history:

```ts
history: {
  past: string[]    // snapshots before current state
  future: string[]  // snapshots after current state (available after undo)
}
```

- **Typing** triggers `updateContent` (immediate) and a debounced `saveContentHistorySnapshot` (500ms after the last keystroke)
- **Undo** pops from `past`, pushes current content to `future`, restores the popped snapshot
- **Redo** is the inverse: pops from `future`, pushes to `past`
- **New content after undo** clears `future` — a new timeline begins

The debounce prevents the history from growing on every keystroke. The separation between `updateContent` and `saveContentHistorySnapshot` keeps the "when to snapshot" decision in the View layer, and the "how to snapshot" logic in the store.

## Architecture

### Electron: Main and Renderer

Electron runs two separate processes:

```
┌─────────────────────────────────────────┐
│              Electron App               │
│                                         │
│  ┌──────────────┐    ┌───────────────┐  │
│  │     Main     │    │   Renderer    │  │
│  │  (Node.js)   │◄──►│    (React)    │  │
│  │              │    │               │  │
│  │  fs, dialog  │    │  components   │  │
│  │  IPC handler │    │  zustand      │  │
│  └──────────────┘    └───────────────┘  │
└─────────────────────────────────────────┘
```

The Renderer has no direct access to the file system. All I/O goes through IPC (Inter-Process Communication):

1. Renderer calls `window.api.saveFile(path, content)`
2. Preload forwards via `ipcRenderer.invoke('save-file', path, content)`
3. Main handles `ipcMain.handle('save-file', ...)` and writes to disk

### IPC channels

| Channel | Direction | Purpose |
|---|---|---|
| `save-file` | Renderer → Main | Save content to existing path |
| `save-file-as` | Renderer → Main | Open save dialog, write file, return path |
| `open-file` | Renderer → Main | Open file dialog, read file, return content |
| `on-confirm-close` | Renderer → Main | Show native confirm dialog, return user choice |

## Project Structure

```
src/
├── main/
│   └── index.ts              ← Electron main process, IPC handlers
├── preload/
│   ├── index.ts              ← contextBridge: exposes window.api
│   └── index.d.ts            ← TypeScript types for window.api
└── renderer/src/
    ├── models/
    │   └── Document.ts       ← EditorDocument interface + factory
    ├── store/
    │   └── useEditorStore.ts ← Zustand store (MVC controller)
    ├── components/
    │   ├── Editor/           ← textarea, keyboard shortcuts, debounce
    │   ├── TabBar/           ← tab list, close button, dirty indicator
    │   └── StatusBar/        ← word count + line count (Observer)
    └── App.tsx
```

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build:mac
npm run build:win
npm run build:linux
```
