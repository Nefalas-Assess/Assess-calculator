import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRecentFiles } from '@renderer/hooks/recentFiles'
import TextItem from './textItem'

export const RecentFilesList = () => {
  const { recentFiles, selectFile, importFile } = useRecentFiles()

  return (
    <div className="recent-files-list">
      <div
        style={{
          textTransform: 'uppercase',
          padding: 10,
          paddingBottom: 5,
          fontSize: 10,
          fontWeight: 'bold',
          opacity: 0.5
        }}
      >
        <TextItem path={'layout.recentFile'} />
      </div>
      {(recentFiles || [])?.map((it, key) => (
        <div className="recent-file-item" key={key} onClick={() => selectFile(it?.path)}>
          {it?.name || it?.path}
        </div>
      ))}
      <div className="recent-file-item" onClick={importFile}>
        ...
      </div>
    </div>
  )
}

export default RecentFilesList
