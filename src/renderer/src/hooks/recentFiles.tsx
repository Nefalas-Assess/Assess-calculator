import { AppContext } from '@renderer/providers/AppProvider'
import { useToast } from '@renderer/providers/ToastProvider'
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
  return (
    filePath
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

  const { setFilePath, setData } = useContext(AppContext)
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
        setData(parsedData)
        const res = getFileNameWithoutExtension(filePath)
        addFile({ path: filePath, name: res })
        addToast('toast.file_imported')
      }
    } catch (err) {
      addToast(err?.toString())
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
        setData(parsedData)

        const res = getFileNameWithoutExtension(filePath)
        addFile({ path: filePath, name: res })
      }

      addToast('toast.file_imported')
    } catch (err) {
      console.log(err)
      addToast(err?.toString())
    }
  }

  const createFile = async (fileName: string): Promise<void> => {
    try {
      const defaultData = {
        version: import.meta.env.VITE_APP_VERSION
      }

      const { canceled, filePath } = await window.api.showSaveDialog({
        title: 'Créer un nouveau fichier',
        defaultPath: `${fileName}.json`,
        // filters: [{ name: 'JSON Files', extensions: ['json'] }, { name: 'All Files', extensions: ['*'] }]
      })

      if (!canceled && filePath) {
        await window.api.writeFile(filePath, JSON.stringify(defaultData, null, 2))
        setFilePath(filePath)
        addFile({ path: filePath, name: fileName })
        setData(defaultData)
        addToast('toast.file_created')
        navigate('/infog')
      }
    } catch (err) {
      addToast('toast.file_creation_error')
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
