import { AppContext } from '@renderer/providers/AppProvider'
import { useToast } from '@renderer/providers/ToastProvider'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

export const useRecentFiles = () => {
  const [recentFiles, setRecentFiles] = useState<string[]>([])

  const { setFilePath, setData } = useContext(AppContext)
  const { addToast } = useToast()

  const navigate = useNavigate()

  // Ajouter un fichier à l'historique
  const addFile = (item) => {
    const updatedFiles = [item, ...(recentFiles || [])?.filter((e) => e?.path !== item?.path)] // Garder les 10 derniers fichiers
    window.api.setStore('recent-files', updatedFiles)
    setRecentFiles(updatedFiles)
  }

  const selectFile = async (filePath) => {
    try {
      if (filePath) {
        const fileData = await window.api.readFile(filePath)
        setFilePath(filePath)
        navigate('/infog')
        const parsedData = JSON.parse(fileData)
        setData(parsedData)
        addFile({ path: filePath, name: parsedData?.general_info?.nom_victime })
        addToast('Fichier importé')
      }
    } catch (err) {
      addToast(err)
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
        navigate('/infog')
        const parsedData = JSON.parse(fileData)
        setData(parsedData)
        addFile({ path: filePath, name: parsedData?.general_info?.nom_victime })
      }

      addToast('Fichier importé')
    } catch (err) {
      addToast("Erreur lors de l'importation du fichier")
    }
  }

  const createFile = async () => {
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
      navigate('/infog')
    } catch (err) {
      setError('Erreur lors de la création du fichier')
    }
  }

  // // Supprimer un fichier de l'historique
  // const removeFile = (filePath) => {
  //   const updatedFiles = recentFiles.filter((file) => file !== filePath)
  //   // store.set('recentFiles', updatedFiles)
  //   setRecentFiles(updatedFiles)
  // }
  // // Vider l'historique
  // const clearHistory = () => {
  //   // store.set('recentFiles', [])
  //   setRecentFiles([])
  // }
  // return { recentFiles, addFile, removeFile, clearHistory }

  useEffect(() => {
    async function fetchRecentFiles() {
      const files = await window.api.getStore('recent-files', [])
      setRecentFiles(files)
    }

    fetchRecentFiles()
  }, [])

  console.log('RECENT FILES', recentFiles)

  return { addFile, importFile, createFile, selectFile, recentFiles }
}
