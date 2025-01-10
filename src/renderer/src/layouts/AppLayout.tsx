import { AppContext } from '@renderer/providers/AppProvider'
import { useContext } from 'react'
import { NavLink, Outlet } from 'react-router'

export const AppLayout = () => {
  const { data, setData } = useContext(AppContext)

  const exportData = () => {
    // Convertir les données en JSON stringifié
    const jsonData = JSON.stringify(data, null, 2)

    // Créer un blob contenant les données JSON
    const blob = new Blob([jsonData], { type: 'application/json' })

    // Créer un lien de téléchargement
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = data?.general_info?.reference_dossier
      ? data?.general_info?.reference_dossier + '.json'
      : 'data.json'

    // Simuler un clic pour démarrer le téléchargement
    document.body.appendChild(link)
    link.click()

    // Nettoyer le DOM
    document.body.removeChild(link)
  }

  const importData = () => {
    const file = event.target.files[0]

    if (file && file.type === 'application/json') {
      const reader = new FileReader()

      reader.onload = function (e) {
        try {
          const jsonData = JSON.parse(e.target.result) // Convertir le contenu en JSON
          setData(jsonData)
        } catch (error) {
          console.error("Erreur lors de l'analyse du fichier JSON :", error)
        }
      }

      reader.onerror = function () {
        console.error('Erreur lors de la lecture du fichier :', reader.error)
      }

      reader.readAsText(file) // Lire le contenu du fichier en tant que texte
    } else {
      alert('Veuillez importer un fichier JSON valide.')
    }
  }

  return (
    <div className="app">
      <div className="app-layout">
        <div className="app-header">
          <div className="left">Ju Calculator</div>
          <div className="right">
            <button onClick={exportData}>Exporter</button>
            <input
              type="file"
              id="loadFileInput"
              style={{ display: 'none' }}
              onChange={importData}
            />
            <button onClick={() => document.getElementById('loadFileInput').click()}>
              Importer
            </button>
          </div>
        </div>
        <div className="core">
          <div className="layout-menu">
            <NavLink to="/infog">Informations générales</NavLink>
            <NavLink to="/itp">Incapacité Temporaire Personnelle</NavLink>
            <NavLink to="/itm">Incapacité Temporaire Ménagère</NavLink>
            <NavLink to="/effa">Efforts Accrus</NavLink>
            <NavLink to="/ip">Incapacité Permanente</NavLink>
          </div>
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
