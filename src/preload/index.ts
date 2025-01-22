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
  print: (content, styles) => ipcRenderer.invoke('print-content', { content, styles })
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
