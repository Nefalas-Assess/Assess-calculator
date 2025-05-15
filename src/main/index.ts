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

  // Ajout de la gestion des arguments de ligne de commande pour ouvrir des fichiers
  if (process.argv.length >= 2) {
    const filePath = process.argv[1]
    if (filePath && filePath.endsWith('.assess')) {
      mainWindow.webContents.once('did-finish-load', () => {
        mainWindow?.webContents.send('open-file', filePath)
      })
    }
  }

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

    const html = `
    <html>
      <head>
        <style>
         ${doc?.styles || ''}
        </style>
      </head>
      <body>
        <div class="print-layout" id="printable">
          <div class="print-header">
            <h2>Assess</h2>
            <img src="file://${doc?.logo || ''}" alt="Logo">
          </div>
          <div class="print-content">
            ${doc?.content || ''}
          </div>
          <div class="print-footer">
            <p>&copy; 2025 - Assess</p>
          </div>
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

  // Gestionnaire pour l'association de fichiers
  ipcMain.handle('register-file-association', async () => {
    if (process.platform === 'win32') {
      app.setAsDefaultProtocolClient('assess')

      // Enregistrer l'extension .assess
      const exePath = process.execPath
      const iconPath = join(app.getAppPath(), 'resources', 'icon.png')

      try {
        const Registry = require('winreg')

        // Créer l'association de fichier
        const fileAssocKey = new Registry({
          hive: Registry.HKCU,
          key: '\\Software\\Classes\\.assess'
        })

        await fileAssocKey.create()
        await fileAssocKey.set('', 'REG_SZ', 'AssessFile')

        // Créer le type de fichier
        const fileTypeKey = new Registry({
          hive: Registry.HKCU,
          key: '\\Software\\Classes\\AssessFile'
        })

        await fileTypeKey.create()
        await fileTypeKey.set('', 'REG_SZ', 'Fichier Assess')

        // Ajouter l'icône
        const iconKey = new Registry({
          hive: Registry.HKCU,
          key: '\\Software\\Classes\\AssessFile\\DefaultIcon'
        })

        await iconKey.create()
        await iconKey.set('', 'REG_SZ', `${iconPath},0`)

        // Ajouter la commande d'ouverture
        const commandKey = new Registry({
          hive: Registry.HKCU,
          key: '\\Software\\Classes\\AssessFile\\shell\\open\\command'
        })

        await commandKey.create()
        await commandKey.set('', 'REG_SZ', `"${exePath}" "%1"`)

        return { success: true }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'association de fichier:", error)
        return { success: false, error }
      }
    } else if (process.platform === 'darwin') {
      // macOS gère les associations de fichiers via Info.plist
      return { success: true, info: 'Sur macOS, les associations sont définies dans Info.plist' }
    } else {
      // Linux utilise des fichiers .desktop
      return {
        success: true,
        info: 'Sur Linux, utilisez des fichiers .desktop pour les associations'
      }
    }
  })

  // Gestionnaire pour l'ouverture de fichiers .assess
  ipcMain.handle('open-assess-file', async (_, filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      return { success: true, content, filePath }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // Gestionnaire pour l'enregistrement de fichiers .assess
  ipcMain.handle('save-assess-file', async (_, filePath, content) => {
    try {
      // Ajouter l'extension .assess si elle n'est pas présente
      if (!filePath.endsWith('.assess')) {
        filePath += '.assess'
      }

      await fs.writeFile(filePath, content, 'utf8')
      return { success: true, filePath }
    } catch (error) {
      return { success: false, error: error.message }
    }
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

  // Gérer l'ouverture de fichiers sur macOS
  app.on('open-file', (event, filePath) => {
    event.preventDefault()
    if (filePath.endsWith('.assess')) {
      if (mainWindow) {
        mainWindow.webContents.send('open-file', filePath)
      } else {
        // Si la fenêtre n'est pas encore créée, stocker le chemin pour l'ouvrir plus tard
        app.on('ready', () => {
          mainWindow.webContents.send('open-file', filePath)
        })
      }
    }
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
  const response = await supabase.functions.invoke('checkLicense', {
    body: { licenseKey, machineId }
  })

  return response?.data && JSON.parse(response?.data)
}

// 📌 Vérifier le cache ou demander validation
ipcMain.handle('check-license', async (event, licenseKey) => {
  if (!store) await initStore()
  const cachedLicense = store.get('license')

  if (cachedLicense) {
    const expiration = cachedLicense.expiration
    const now = Date.now()

    if (now < expiration) {
      return { valid: true, cached: true } // 🔥 Licence encore valide
    }
  }

  // 🔥 Vérifier la licence et l'association avec l'appareil
  const result = await validateLicense(licenseKey)
  if (result.valid) {
    attemptCache[machineId] = {}
    store.set('license', { key: licenseKey, expiration: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  } else {
    store.delete('license')
  }

  return result
})
