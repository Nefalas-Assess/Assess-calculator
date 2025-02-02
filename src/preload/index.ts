import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
// Custom APIs for renderer
const api = {
  // Fonction pour montrer une boîte de dialogue "Ouvrir"
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpenDialog', options),

  // Fonction pour montrer une boîte de dialogue "Sauvegarder"
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSaveDialog', options),

  // Fonction pour écrire un fichier
  writeFile: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content),

  // Fonction pour lire un fichier
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),

  // Fonction pour imprimer un fichier
  print: (content, styles, logo) => ipcRenderer.invoke('print-content', { content, styles, logo }),

  resolvePath: (path) => ipcRenderer.invoke('resolve-path', path),

  checkForUpdates: () => ipcRenderer.send('check_for_updates'),
  restartApp: () => ipcRenderer.send('restart_app'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update_not_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  onUpdateError: (callback) => ipcRenderer.on('update_error', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),

  // Electron store
  getStore: (key) => ipcRenderer.invoke('store:get', key),
  clearStore: () => ipcRenderer.invoke('store:clear'),
  deleteStore: (key) => ipcRenderer.invoke('store:delete', key),
  setStore: (key, value) => ipcRenderer.invoke('store:set', key, value)
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
