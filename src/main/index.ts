import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { autoUpdater } from 'electron-updater'
import { promises as fs } from 'fs'

let mainWindow: BrowserWindow | null = null
let ipcHandlersRegistered = false // Variable pour vérifier si les gestionnaires IPC sont déjà enregistrés

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
    console.log('App path', appPath)
    console.log('Chemin relatif reçu :', relativePath)
    const resolvedPath = path.resolve(appPath, relativePath)
    console.log('Chemin absolu résolu :', resolvedPath)
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
