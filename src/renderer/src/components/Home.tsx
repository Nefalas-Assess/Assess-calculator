import TextItem from '@renderer/generic/textItem'
import { useRecentFiles } from '@renderer/hooks/recentFiles'
import { useState } from 'react'

const Home = () => {
  const { importFile, createFile } = useRecentFiles()

  const [fileName, setFileName] = useState(null)

  return (
    <div className="home">
      <div className="home-container">
        <TextItem path="home.reference" />
        <input
          type="text"
          name="reference_dossier"
          size="30"
          onChange={(e) => setFileName(e?.target?.value)}
        />
        <button
          className="create-file"
          onClick={() => createFile(fileName)}
          disabled={!fileName}
          style={{ marginRight: '10px', opacity: !fileName ? 0.5 : 1 }}
        >
          <TextItem path="home.create" />
        </button>
        <div className="separator"></div>
        <button onClick={importFile}>
          <TextItem path="home.import" />
        </button>
      </div>
    </div>
  )
}

export default Home
