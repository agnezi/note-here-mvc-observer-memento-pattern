import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

function saveFileAs(content: string): Promise<{ filePath: string } | null> {
  return ipcRenderer.invoke('save-file-as', content)
}

function saveFile(filePath: string, content: string): Promise<void> {
  return ipcRenderer.invoke('save-file', filePath, content)
}

function openFile(): Promise<{ filePath: string; content: string } | null> {
  return ipcRenderer.invoke('open-file')
}

function confirmCloseTab(): Promise<'save' | 'discard' | 'cancel'> {
  return ipcRenderer.invoke('on-confirm-close')
}

// Custom APIs for renderer
const api = {
  saveFile,
  openFile,
  saveFileAs,
  confirmCloseTab
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
