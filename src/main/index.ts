import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { autoUpdater } from 'electron-updater'
import { promises as fs } from 'fs'
import supabase from '../renderer/src/utils/supabase'
import { machineIdSync } from 'node-machine-id'

let mainWindow: BrowserWindow | null = null
let ipcHandlersRegistered = false // Variable pour vérifier si les gestionnaires IPC sont déjà enregistrés

let Store: any
let store: any

// Import dynamique de `electron-store`
async function initStore() {
  const module = await import('electron-store')
  Store = module.default
  store = new Store()
}

async function hasInternetConnection(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // 1 seconde

    const response = await fetch('https://1.1.1.1', {
      // DNS Cloudflare - très rapide
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    return false
  }
}

const machineId = machineIdSync()

function createWindow(): void {
  // Créez la fenêtre principale
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  autoUpdater.checkForUpdatesAndNotify()

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Chargez l'URL de développement ou le fichier HTML de production
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Enregistrez les gestionnaires IPC une seule fois
  if (!ipcHandlersRegistered) {
    registerIpcHandlers()
    ipcHandlersRegistered = true // Marquez les gestionnaires comme enregistrés
  }
}

// Fonction pour enregistrer les gestionnaires IPC
function registerIpcHandlers(): void {
  ipcMain.handle('dialog:showSaveDialog', async (_, options) => {
    return dialog.showSaveDialog(mainWindow!, options)
  })

  ipcMain.handle('dialog:showOpenDialog', async (_, options) => {
    return dialog.showOpenDialog(mainWindow!, options)
  })

  ipcMain.handle('file:write', async (_, filePath, content) => {
    await fs.writeFile(filePath, content, 'utf8')
    return { success: true }
  })

  ipcMain.handle('file:read', async (_, filePath) => {
    return fs.readFile(filePath, 'utf8')
  })

  ipcMain.handle('resolve-path', async (_, relativePath) => {
    const appPath = app.getAppPath()
    const resolvedPath = path.resolve(appPath, relativePath)
    return resolvedPath
  })

  ipcMain.handle('print-content', (event, doc) => {
    const printWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false
      }
    })

    // Fix the logo path logic
    let logoPath
    if (is.dev) {
      logoPath = path.resolve(__dirname, '../../resources/icon.png')
    } else {
      // In production, resources are in the app.asar.unpacked directory
      logoPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'icon.png')
    }

    const html = `
    <html>
      <head>
        <style>
         ${doc?.styles || ''}
        </style>
      </head>
      <body>
        <div class="print-margin">
          <img src="file://${logoPath || ''}" alt="Logo">
          <div class="print-margin-bottom">
            <p>&copy; 2025 - Evalix</p>
          </div>
        </div>
        <div class="print-content">
          ${doc?.content || ''}
        </div>
      </body>
    </html>
    `

    printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

    printWindow.webContents.on('did-finish-load', () => {
      printWindow.webContents.print({ silent: false }, (success, errorType) => {
        if (!success) console.error("Erreur lors de l'impression:", errorType)
        printWindow.close()
      })
    })
  })

  // Vérifier que `electron-store` est bien initialisé avant d'exécuter les commandes
  ipcMain.handle('store:get', async (_event, key) => {
    if (!store) await initStore()
    return store.get(key)
  })

  ipcMain.handle('store:set', async (_event, key, value) => {
    if (!store) await initStore()
    store.set(key, value)
    return { success: true }
  })

  ipcMain.handle('store:delete', async (_event, key) => {
    if (!store) await initStore()
    store.delete(key)
    return { success: true }
  })

  ipcMain.handle('store:clear', async () => {
    if (!store) await initStore()
    store.clear()
    return { success: true }
  })
}

// Initialisation de l'application
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Fermeture de l'application
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Événements de l'autoUpdater
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available')
})

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded')
})

autoUpdater.on('update-not-available', () => {
  mainWindow.webContents.send('update_not_available')
})

// Événement pour suivre la progression du téléchargement
autoUpdater.on('download-progress', (progress) => {
  mainWindow.webContents.send('download-progress', progress)
})

autoUpdater.on('error', (error) => {
  mainWindow.webContents.send('update_error', error)
})

// Gérer la demande de vérification manuelle des mises à jour
ipcMain.on('check_for_updates', () => {
  autoUpdater.checkForUpdates()
})

// Gérer la demande de redémarrage pour appliquer la mise à jour
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall()
})

ipcMain.handle('get-computer-info', async () => {
  return {
    machineId
  }
})

const attemptCache = {}

// Rate limiting
function checkAttempts(ip) {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxAttempts = 5

  if (!attemptCache[ip]) {
    attemptCache[ip] = { attempts: 1, lastAttempt: now }
  } else {
    const { attempts, lastAttempt } = attemptCache[ip]

    if (now - lastAttempt > windowMs) {
      attemptCache[ip] = { attempts: 1, lastAttempt: now }
    } else if (attempts >= maxAttempts) {
      return false
    } else {
      attemptCache[ip].attempts += 1
      attemptCache[ip].lastAttempt = now
    }
  }

  return true
}

// 📌 Fonction pour valider la licence
async function validateLicense(licenseKey) {
  const response = await supabase.functions.invoke('check-license', {
    body: { licenseKey, machineId }
  })

  return response?.data && JSON.parse(response?.data)
}

// 📌 Vérifier le cache ou demander validation
ipcMain.handle('check-license', async (event, licenseKey) => {
  if (!store) await initStore()
  const cachedLicense = store.get('license')

  const hasInternet = await hasInternetConnection()

  if (cachedLicense && !hasInternet) {
    const expiration = cachedLicense.expiration
    const now = Date.now()

    if (now < expiration) {
      return { valid: true, cached: true } // 🔥 Licence encore valide
    }
  }

  const key = licenseKey || cachedLicense?.key

  // 🔥 Vérifier la licence et l'association avec l’appareil
  const result = await validateLicense(key)
  if (result.valid) {
    attemptCache[machineId] = {}
    store.set('license', { key: key, expiration: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  } else {
    store.delete('license')
  }

  return result
})

// Fonction pour désactiver un appareil
async function disableDevice(licenseKey) {
  const response = await supabase.functions.invoke('remove-device', {
    body: { licenseKey, machineId }
  })
  return response?.data && JSON.parse(response?.data)
}

ipcMain.handle('disable-device', async () => {
  const key = store.get('license')?.key

  const result = await disableDevice(key)

  if (result.success) {
    store.delete('license')
  }
  return result
})
