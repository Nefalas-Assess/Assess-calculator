require('dotenv').config() // Charge les variables d'environnement
const { spawn } = require('child_process')

// Lance electron-builder via npx
const child = spawn('npx', ['electron-builder'], { stdio: 'inherit', shell: true })

child.on('close', (code) => {
  console.log(`Processus terminé avec le code ${code}`)
})
