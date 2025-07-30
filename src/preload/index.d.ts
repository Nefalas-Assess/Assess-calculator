import { ElectronAPI } from '@electron-toolkit/preload'

// Define the API interface for better type safety
interface CustomAPI {
  showOpenDialog: (options: any) => Promise<{ canceled: boolean; filePaths: string[] }>
  showSaveDialog: (options: any) => Promise<{ canceled: boolean; filePath: string }>
  writeFile: (filePath: string, content: string) => Promise<void>
  readFile: (filePath: string) => Promise<string>
  print: (content: any, styles: any, logo: any) => Promise<void>
  resolvePath: (path: string) => Promise<string>
  checkForUpdates: () => void
  restartApp: () => void
  onUpdateAvailable: (callback: any) => void
  onUpdateNotAvailable: (callback: any) => void
  onUpdateDownloaded: (callback: any) => void
  onUpdateError: (callback: any) => void
  onDownloadProgress: (callback: any) => void
  getStore: (key: string, defaultValue?: any) => Promise<any>
  clearStore: () => Promise<void>
  deleteStore: (key: string) => Promise<void>
  setStore: (key: string, value: any) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
