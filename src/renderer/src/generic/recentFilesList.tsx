import { useMemo, useState } from 'react'
import { useRecentFiles } from '@renderer/hooks/recentFiles'
import TextItem, { useTranslation } from './textItem'

export const RecentFilesList = () => {
  const { recentFiles, selectFile, importFile } = useRecentFiles()
  const translate = useTranslation()
  const [query, setQuery] = useState('')

  const filteredFiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return recentFiles || []
    }

    return (recentFiles || []).filter((file) => {
      const label = (file?.name || file?.path || '').toLowerCase()
      return label.includes(normalizedQuery)
    })
  }, [recentFiles, query])

  return (
    <div className="recent-files-list">
      <div className="recent-files-inner">
        <div className="recent-files-title">
          <TextItem path={'layout.recentFile'} />
        </div>
        <div className="recent-files-search">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={translate('layout.recentFileSearch')}
          />
        </div>
        {filteredFiles?.map((it, key) => (
          <div className="recent-file-item" key={key} onClick={() => selectFile(it?.path)}>
            {it?.name || it?.path}
          </div>
        ))}
        {query.trim().length > 0 && filteredFiles.length === 0 && (
          <div className="recent-file-empty">
            <TextItem path={'layout.recentFileEmpty'} />
          </div>
        )}
        <div className="recent-file-item" onClick={importFile}>
          ...
        </div>
      </div>
    </div>
  )
}

export default RecentFilesList
