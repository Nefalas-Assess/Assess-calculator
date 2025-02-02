import { useRecentFiles } from '@renderer/hooks/recentFiles'
import { useState } from 'react'

const Home = () => {
  const { importFile, createFile } = useRecentFiles()

  const [fileName, setFileName] = useState(null)

  return (
    <div className="home">
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
          onClick={createFile}
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
