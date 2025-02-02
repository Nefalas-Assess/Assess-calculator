import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRecentFiles } from '@renderer/hooks/recentFiles'

export const RecentFilesList = () => {
  const { recentFiles, selectFile } = useRecentFiles()

  return (
    <div style={{ padding: 10 }}>
      <div style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 'bold', opacity: 0.8 }}>
        Dossier recents
      </div>
      {(recentFiles || [])?.map((it, key) => (
        <div key={key} onClick={() => selectFile(it?.path)}>
          {it?.name || it?.path}
        </div>
      ))}
    </div>
  )
}

export default RecentFilesList
