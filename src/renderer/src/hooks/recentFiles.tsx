import { AppContext } from '@renderer/providers/AppProvider'
import { useToast } from '@renderer/providers/ToastProvider'
import { useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'

const getFileNameWithoutExtension = (filePath: string): string => {
  return (
    filePath
      .split('/')
      .pop()
      ?.replace(/\.[^/.]+$/, '') || ''
  )
}

export const useRecentFiles = () => {
  const [recentFiles, setRecentFiles] = useState<string[]>([])

  const { setFilePath, setData, data } = useContext(AppContext)
  const { addToast, showToast } = useToast()

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
        const res = getFileNameWithoutExtension(filePath)
        addFile({ path: filePath, name: res })
        addToast('Fichier importé')
      }
    } catch (err) {
      addToast(err?.toString())
    }
  }

  const importFile = useCallback(async () => {
    try {
      const result = await window.api.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Fichiers Assess', extensions: ['assess'] },
          { name: 'Tous les fichiers', extensions: ['*'] }
        ]
      })

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return
      }

      const filePath = result.filePaths[0]

      // Vérifier si c'est un fichier .assess
      if (filePath.endsWith('.assess')) {
        const fileResult = await window.api.openAssessFile(filePath)

        if (fileResult.success) {
          const fileData = JSON.parse(fileResult.content)
          setData(fileData)

          // Ajouter aux fichiers récents
          const recentFiles = JSON.parse(localStorage.getItem('recentFiles') || '[]')
          const updatedRecentFiles = [
            { path: filePath, name: filePath.split('/').pop().split('\\').pop() },
            ...recentFiles.filter((file) => file.path !== filePath)
          ].slice(0, 10) // Garder seulement les 10 plus récents

          localStorage.setItem('recentFiles', JSON.stringify(updatedRecentFiles))

          navigate('/infog')
          showToast('Fichier importé avec succès', 'success')
        } else {
          showToast(`Erreur lors de l'ouverture du fichier: ${fileResult.error}`, 'error')
        }
      } else {
        // Gestion des autres types de fichiers si nécessaire
        const content = await window.api.readFile(filePath)
        const fileData = JSON.parse(content)
        setData(fileData)
        navigate('/infog')
        showToast('Fichier importé avec succès', 'success')
      }
    } catch (error) {
      showToast(`Erreur lors de l'importation: ${error.message}`, 'error')
    }
  }, [setData, navigate, showToast])

  const createFile = useCallback(
    async (fileName) => {
      if (!fileName) return

      try {
        const result = await window.api.showSaveDialog({
          title: 'Créer un nouveau fichier',
          defaultPath: `${fileName}.assess`,
          filters: [{ name: 'Fichiers Assess', extensions: ['assess'] }]
        })

        if (result.canceled || !result.filePath) {
          return
        }

        const filePath = result.filePath
        const initialData = { general_info: { reference: fileName } }

        const saveResult = await window.api.saveAssessFile(filePath, JSON.stringify(initialData))

        if (saveResult.success) {
          setData(initialData)

          // Ajouter aux fichiers récents
          const recentFiles = JSON.parse(localStorage.getItem('recentFiles') || '[]')
          const updatedRecentFiles = [
            { path: filePath, name: fileName },
            ...recentFiles.filter((file) => file.path !== filePath)
          ].slice(0, 10)

          localStorage.setItem('recentFiles', JSON.stringify(updatedRecentFiles))

          navigate('/infog')
          showToast('Fichier créé avec succès', 'success')
        } else {
          showToast(`Erreur lors de la création du fichier: ${saveResult.error}`, 'error')
        }
      } catch (error) {
        showToast(`Erreur lors de la création: ${error.message}`, 'error')
      }
    },
    [setData, navigate, showToast]
  )

  const saveFile = useCallback(async () => {
    if (!data) return

    try {
      const result = await window.api.showSaveDialog({
        title: 'Enregistrer le fichier',
        defaultPath: `${data.general_info?.reference || 'sans-titre'}.assess`,
        filters: [{ name: 'Fichiers Assess', extensions: ['assess'] }]
      })

      if (result.canceled || !result.filePath) {
        return
      }

      const filePath = result.filePath
      const saveResult = await window.api.saveAssessFile(filePath, JSON.stringify(data))

      if (saveResult.success) {
        // Ajouter aux fichiers récents
        const recentFiles = JSON.parse(localStorage.getItem('recentFiles') || '[]')
        const updatedRecentFiles = [
          {
            path: filePath,
            name: data.general_info?.reference || filePath.split('/').pop().split('\\').pop()
          },
          ...recentFiles.filter((file) => file.path !== filePath)
        ].slice(0, 10)

        localStorage.setItem('recentFiles', JSON.stringify(updatedRecentFiles))

        showToast('Fichier enregistré avec succès', 'success')
      } else {
        showToast(`Erreur lors de l'enregistrement: ${saveResult.error}`, 'error')
      }
    } catch (error) {
      showToast(`Erreur lors de l'enregistrement: ${error.message}`, 'error')
    }
  }, [data, showToast])

  useEffect(() => {
    async function fetchRecentFiles() {
      const files = await window.api.getStore('recent-files', [])
      setRecentFiles(files)
    }

    fetchRecentFiles()
  }, [])

  return { addFile, importFile, createFile, selectFile, recentFiles, saveFile }
}
