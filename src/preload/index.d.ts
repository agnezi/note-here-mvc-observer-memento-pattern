import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveFile: (filePath: string, content: string) => Promise<void>
      openFile: () => Promise<{ filePath: string; content: string } | null>
      saveFileAs: (content: string) => Promise<{ filePath: string } | null>
      confirmCloseTab: () => Promise<'save' | 'discard' | 'cancel'>
    }
  }
}
