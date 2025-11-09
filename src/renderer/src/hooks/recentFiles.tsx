import { AppContext } from '@renderer/providers/AppProvider'
import { useToast } from '@renderer/providers/ToastProvider'
import { migrateData, prepareDataForSave } from '@renderer/utils/migrations'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

interface RecentFile {
  path: string
  name: string
}

interface RecentFilesHook {
  addFile: (item: RecentFile) => void
  importFile: () => Promise<void>
  createFile: (fileName: string) => Promise<void>
  selectFile: (filePath: string) => Promise<void>
  recentFiles: RecentFile[]
}

const getFileNameWithoutExtension = (filePath: string): string => {
  const normalizedPath = filePath.replace(/\\/g, '/')
  return (
    normalizedPath
      .split('/')
      .pop()
      ?.replace(/\.[^/.]+$/, '') || ''
  )
}

const removeBOM = (str: string): string => {
  if (str.charCodeAt(0) === 0xfeff) {
    return str.slice(1)
  }
  return str
}

export const useRecentFiles = (): RecentFilesHook => {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([])

  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useRecentFiles must be used within an AppProvider')
  }
  const { setFilePath, setData } = context
  const { addToast } = useToast()
  const navigate = useNavigate()

  const addFile = (item: RecentFile): void => {
    const updatedFiles = [item, ...(recentFiles || []).filter((e) => e.path !== item.path)]
    window.api.setStore('recent-files', updatedFiles)
    setRecentFiles(updatedFiles)
  }

  const selectFile = async (filePath: string): Promise<void> => {
    try {
      if (filePath) {
        const fileData = await window.api.readFile(filePath)
        setFilePath(filePath)
        navigate('/infog')
        const cleanData = removeBOM(fileData)
        const parsedData = JSON.parse(cleanData)

        // Apply migration if needed
        const currentVersion = import.meta.env.VITE_APP_VERSION
        const migratedData = migrateData(parsedData, currentVersion)

        setData(migratedData)
        const res = getFileNameWithoutExtension(filePath)
        addFile({ path: filePath, name: res })
        addToast('toast.file_imported')
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      addToast(errorMessage)
    }
  }

  const importFile = async (): Promise<void> => {
    try {
      const { canceled, filePaths } = await window.api.showOpenDialog({
        title: 'Importer un fichier',
        // filters: [{ name: 'JSON Files', extensions: ['json'] }, { name: 'All Files', extensions: ['*'] }],
        properties: ['openFile']
      })

      if (!canceled && filePaths.length > 0) {
        const filePath = filePaths[0]
        const fileData = await window.api.readFile(filePath)
        setFilePath(filePath)
        navigate('/infog')

        const cleanData = removeBOM(fileData)
        const parsedData = JSON.parse(cleanData)

        // Apply migration if needed
        const currentVersion = import.meta.env.VITE_APP_VERSION
        const migratedData = migrateData(parsedData, currentVersion)

        setData(migratedData)

        const res = getFileNameWithoutExtension(filePath)
        addFile({ path: filePath, name: res })
      }

      addToast('toast.file_imported')
    } catch (err: unknown) {
      console.log(err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      addToast(errorMessage)
    }
  }

  const createFile = async (fileName: string): Promise<void> => {
    try {
      const defaultData = {
        version: import.meta.env.VITE_APP_VERSION
      }

      const { canceled, filePath } = await window.api.showSaveDialog({
        title: 'Créer un nouveau fichier',
        defaultPath: `${fileName}.json`
        // filters: [{ name: 'JSON Files', extensions: ['json'] }, { name: 'All Files', extensions: ['*'] }]
      })

      if (!canceled && filePath) {
        // Ensure the data has the correct version
        const currentVersion = import.meta.env.VITE_APP_VERSION
        const dataToSave = prepareDataForSave(defaultData, currentVersion)

        await window.api.writeFile(filePath, JSON.stringify(dataToSave, null, 2))
        setFilePath(filePath)
        addFile({ path: filePath, name: fileName })
        setData(dataToSave)
        addToast('toast.file_created')
        navigate('/infog')
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'File creation failed'
      addToast('toast.file_creation_error')
      console.error(errorMessage)
    }
  }

  useEffect(() => {
    async function fetchRecentFiles(): Promise<void> {
      const files = await window.api.getStore('recent-files', [])
      setRecentFiles(files)
    }

    fetchRecentFiles()
  }, [])

  return { addFile, importFile, createFile, selectFile, recentFiles }
}
