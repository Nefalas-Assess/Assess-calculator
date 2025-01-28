import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
const fs = require('fs').promises

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
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
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  ipcMain.handle('dialog:showSaveDialog', async (_, options) => {
    return dialog.showSaveDialog(mainWindow, options)
  })

  ipcMain.handle('dialog:showOpenDialog', async (_, options) => {
    return dialog.showOpenDialog(mainWindow, options)
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
    // Créez une nouvelle fenêtre invisible pour l'impression
    const printWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false, // La fenêtre est invisible
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false
      }
    })

    // Injectez le contenu HTML et les styles
    const html = `
    <html>
      <head>
        <style>
         ${doc?.styles || ''}
        </style>
      </head>
      <body>
        <div class="print-layout" id="printable">
          <!-- Header -->
          <div class="print-header">
            <h2>Assess</h2>
            <img src="file://${doc?.logo || ''}" alt="Logo"> <!-- Logo -->
          </div>

          <!-- Contenu principal -->
          <div class="print-content">
            ${doc?.content || ''}
          </div>

          <!-- Footer -->
          <div class="print-footer">
            <p>&copy; 2025 - Assess</p>
          </div>
        </div>
      </body>
    </html>
    `

    printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

    // Chargez le contenu HTML de la div dans la fenêtre

    // Une fois le contenu chargé, imprimez
    printWindow.webContents.on('did-finish-load', () => {
      printWindow.webContents.print({ silent: false }, (success, errorType) => {
        if (!success) console.error("Erreur lors de l'impression:", errorType)
        printWindow.close() // Fermez la fenêtre après l'impression
      })
    })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
