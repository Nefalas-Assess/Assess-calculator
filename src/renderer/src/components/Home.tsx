import { AppContext } from '@renderer/providers/AppProvider'
import { useToast } from '@renderer/providers/ToastProvider'
import { useContext, useState } from 'react'

const Home = () => {
  const { setFilePath, setData } = useContext(AppContext)

  const { addToast } = useToast()

  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)

  const createNewFile = async () => {
    try {
      // Données initiales pour le fichier
      const defaultData = {}

      // Appel pour sauvegarder un nouveau fichier
      const { canceled, filePath } = await window.api.showSaveDialog({
        title: 'Créer un nouveau fichier',
        defaultPath: `${fileName}.json`,
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      })

      if (!canceled && filePath) {
        await window.api.writeFile(filePath, JSON.stringify(defaultData, null, 2))
        setFilePath(filePath)
      }

      addToast('Fichier créé')
    } catch (err) {
      setError('Erreur lors de la création du fichier')
      console.error(err)
    }
  }

  const importFile = async () => {
    try {
      const { canceled, filePaths } = await window.api.showOpenDialog({
        title: 'Importer un fichier',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile']
      })

      if (!canceled && filePaths.length > 0) {
        const filePath = filePaths[0]
        const fileData = await window.api.readFile(filePath)
        setFilePath(filePath)
        setData(JSON.parse(fileData))
      }

      addToast('Fichier importé')
    } catch (err) {
      setError("Erreur lors de l'importation du fichier")
      console.error(err)
    }
  }

  return (
    <div className="home">
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="home-container">
        <span>Référence du dossier: </span>
        <input
          type="text"
          name="reference_dossier"
          size="30"
          onChange={(e) => setFileName(e?.target?.value)}
        />
        <button
          className="create-file"
          onClick={createNewFile}
          disabled={!fileName}
          style={{ marginRight: '10px', opacity: !fileName ? 0.5 : 1 }}
        >
          Créer un nouveau fichier
        </button>
        <div className="separator"></div>
        <button onClick={importFile}>Importer un fichier existant</button>
      </div>
    </div>
  )
}

export default Home
