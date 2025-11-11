import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import TextItem, { useTranslation } from '@renderer/generic/textItem'
import { useNavigate, useParams, useLocation } from 'react-router'
import { useToast } from '@renderer/providers/ToastProvider'
import { AppContext } from '@renderer/providers/AppProvider'

type CustomReference = {
  id: string
  label: string
}

type CustomFile = {
  name: string
}

type EditorType = 'matrix' | 'table' | 'array' | 'object-array' | 'unknown'

type EditorRow = {
  key?: string
  values: string[]
}

const DEFAULT_COLUMNS = 6

const sanitizeModuleContent = (content: string) => {
  return content.replace(/export\s+default/, '').trim().replace(/;?\s*$/, '')
}

const toJsonCompatible = (content: string) => {
  return content
    .replace(/(\r\n|\r)/g, '\n')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/([{\[,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":')
    .replace(/'/g, '"')
}

const evaluateModuleValue = (content: string) => {
  try {
    const sanitized = sanitizeModuleContent(content)
    if (!sanitized) return undefined
    // eslint-disable-next-line no-new-func
    return new Function(`return (${sanitized});`)()
  } catch (error) {
    console.warn('Unable to evaluate custom file with Function, fallback to JSON parser.', error)
  }

  try {
    const sanitized = sanitizeModuleContent(content)
    const jsonReady = toJsonCompatible(sanitized)
    return JSON.parse(jsonReady)
  } catch (jsonError) {
    console.error('Unable to parse custom file', jsonError)
    return undefined
  }
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const detectEditorType = (value: unknown): EditorType => {
  if (Array.isArray(value)) {
    if (value.every((row) => Array.isArray(row))) {
      return 'matrix'
    }
    if (value.every((row) => isPlainObject(row))) {
      return 'object-array'
    }
    if (value.every((cell) => typeof cell === 'number')) {
      return 'array'
    }
    return 'matrix'
  }

  if (isPlainObject(value)) {
    const entries = Object.values(value || {})
    if (entries.length === 0) return 'table'
    if (entries.every((row) => Array.isArray(row))) {
      return 'table'
    }
    return 'table'
  }

  return 'unknown'
}

const toCellValue = (value: unknown) => {
  if (value === undefined || value === null) return ''
  return value.toString()
}

const padValues = (values: string[], targetLength: number) => {
  const next = [...values]
  while (next.length < targetLength) {
    next.push('')
  }
  return next
}

const createEditorState = (value: any, type: EditorType) => {
  if (type === 'matrix') {
    const rowsArray = Array.isArray(value) ? value : []
    const columnCount = Math.max(
      DEFAULT_COLUMNS,
      ...rowsArray.map((row) => {
        if (Array.isArray(row)) {
          return row.length
        }
        return row !== undefined && row !== null ? 1 : 0
      })
    )
    const rows: EditorRow[] = rowsArray.map((row: any) => {
      const normalizedRow = Array.isArray(row) ? row : [row]
      return {
        values: padValues(normalizedRow.map((cell) => toCellValue(cell)), columnCount)
      }
    })
    return { rows, columnCount }
  }

  if (type === 'table') {
    const entries = Object.entries(value || {})
    const columnCount = Math.max(
      DEFAULT_COLUMNS,
      ...entries.map(([, row]) =>
        Array.isArray(row) ? row.length : row !== undefined && row !== null ? 1 : 0
      )
    )
    const rows: EditorRow[] = entries.map(([key, row]) => ({
      key,
      values: padValues(
        Array.isArray(row)
          ? (row as unknown[]).map((cell) => toCellValue(cell))
          : [toCellValue(row)],
        columnCount
      )
    }))
    return { rows, columnCount }
  }

  if (type === 'object-array') {
    const rowsArray = Array.isArray(value) ? value : []
    const columns = Array.from(
      new Set(
        rowsArray.reduce<string[]>((acc, row) => {
          Object.keys(row || {}).forEach((key) => acc.push(key))
          return acc
        }, [])
      )
    )

    if (columns.length === 0) {
      columns.push('field_1')
    }

    const rows: EditorRow[] = rowsArray.map((row: Record<string, unknown>) => ({
      values: columns.map((column) => toCellValue(row?.[column]))
    }))
    return { rows, columnCount: columns.length, columns }
  }

  if (type === 'array') {
    const rows: EditorRow[] = (value || []).map((cell: number) => ({
      values: [toCellValue(cell)]
    }))
    return { rows, columnCount: 1 }
  }

  return { rows: [], columnCount: DEFAULT_COLUMNS }
}

const normalizeNumberValue = (value: string) => {
  if (value === undefined || value === null || value === '') return 0
  const normalized = value.replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatModuleValue = (value: any) => {
  return `export default ${JSON.stringify(value, null, 2)}\n`
}

const buildValueFromEditor = (
  rows: EditorRow[],
  type: EditorType,
  columnCount: number,
  objectColumns: string[]
) => {
  if (type === 'matrix') {
    return rows.map((row) =>
      row.values.slice(0, columnCount).map((cell) => normalizeNumberValue(cell))
    )
  }

  if (type === 'array') {
    return rows.map((row) => normalizeNumberValue(row.values[0] || ''))
  }

  if (type === 'object-array') {
    return rows.map((row) => {
      return objectColumns.reduce<Record<string, string>>((acc, column, index) => {
        acc[column] = row.values[index] ?? ''
        return acc
      }, {})
    })
  }

  if (type === 'table') {
    return rows.reduce<Record<string, number[]>>((acc, row) => {
      const key = (row.key || '').trim()
      if (!key) return acc
      acc[key] = row.values.slice(0, columnCount).map((cell) => normalizeNumberValue(cell))
      return acc
    }, {})
  }

  return null
}

const SettingsEditor = () => {
  const { datasetId = '' } = useParams()
  const location = useLocation()
  const { addToast } = useToast()
  const { refreshReferenceTypes } = useContext(AppContext)
  const translate = useTranslation()
  const navigate = useNavigate()

  const labelFromState = (location.state as { label?: string })?.label
  const [dataset, setDataset] = useState<CustomReference | null>(
    labelFromState ? { id: datasetId, label: labelFromState } : null
  )

  const [files, setFiles] = useState<CustomFile[]>([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isFileLoading, setIsFileLoading] = useState(false)
  const [isSavingFile, setIsSavingFile] = useState(false)
  const [editorType, setEditorType] = useState<EditorType | null>(null)
  const [editorRows, setEditorRows] = useState<EditorRow[]>([])
  const [columnCount, setColumnCount] = useState<number>(DEFAULT_COLUMNS)
  const [objectColumns, setObjectColumns] = useState<string[]>([])
  const [rawContent, setRawContent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const loadDatasetInfo = useCallback(async () => {
    if (dataset) return
    try {
      const sets = await window.api.listCustomReferences?.()
      const found = (sets || []).find((item) => item.id === datasetId)
      if (found) {
        setDataset(found)
      }
    } catch (error) {
      console.error('Unable to load dataset info', error)
    }
  }, [dataset, datasetId])

  const loadFiles = useCallback(async () => {
    if (!datasetId) return
    try {
      setFilesLoading(true)
      const response = await window.api.listCustomFiles?.(datasetId)
      setFiles(response || [])
    } catch (err) {
      console.error('Unable to list files', err)
      setFileError('settings.files.errors.load')
    } finally {
      setFilesLoading(false)
    }
  }, [datasetId])

  useEffect(() => {
    loadDatasetInfo()
  }, [loadDatasetInfo])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const resetEditor = useCallback(() => {
    setSelectedFile(null)
    setEditorType(null)
    setEditorRows([])
    setColumnCount(DEFAULT_COLUMNS)
    setObjectColumns([])
    setRawContent('')
    setHasChanges(false)
    setFileError(null)
  }, [])

  const handleSelectFile = async (fileName: string) => {
    if (!datasetId) return

    setSelectedFile(fileName)
    setFileError(null)
    setEditorType(null)
    setEditorRows([])
    setColumnCount(DEFAULT_COLUMNS)
    setObjectColumns([])
    setHasChanges(false)

    try {
      setIsFileLoading(true)
      const content = await window.api.readCustomFile({
        id: datasetId,
        file: fileName
      })
      setRawContent(content)
      const value = evaluateModuleValue(content)
      const type = detectEditorType(value)
      if (type === 'unknown') {
        setEditorType('unknown')
      } else {
        const state = createEditorState(value, type)
        setEditorType(type)
        setEditorRows(state.rows)
        setColumnCount(state.columnCount)
        setObjectColumns(state.columns || [])
      }
    } catch (err) {
      console.error('Unable to read custom file', err)
      setFileError('settings.files.errors.read')
    } finally {
      setIsFileLoading(false)
    }
  }

  const handleAddRow = () => {
    setEditorRows((prev) => {
      if (editorType === 'table') {
        return [...prev, { key: '', values: padValues([], columnCount) }]
      }
      if (editorType === 'object-array') {
        const columns = objectColumns.length ? objectColumns : ['field_1']
        if (objectColumns.length === 0) {
          setObjectColumns(columns)
          setColumnCount(1)
        }
        return [...prev, { values: padValues([], columns.length) }]
      }
      return [...prev, { values: padValues([], columnCount) }]
    })
    setHasChanges(true)
  }

  const handleRemoveRow = (rowIndex: number) => {
    setEditorRows((prev) => prev.filter((_, index) => index !== rowIndex))
    setHasChanges(true)
  }

  const handleCellChange = (rowIndex: number, columnIndex: number, value: string) => {
    setEditorRows((prev) =>
      prev.map((row, index) => {
        if (index !== rowIndex) return row
        const nextValues = [...row.values]
        nextValues[columnIndex] = value
        return { ...row, values: nextValues }
      })
    )
    setHasChanges(true)
  }

  const handleRawChange = (content: string) => {
    setRawContent(content)
    setHasChanges(true)
  }

  const handleReloadFile = () => {
    if (selectedFile) {
      handleSelectFile(selectedFile)
    }
  }

  const handleSaveFile = async () => {
    if (!datasetId || !selectedFile) return

    try {
      setIsSavingFile(true)
      let contentToSave = rawContent

      if (editorType && editorType !== 'unknown') {
        const newValue = buildValueFromEditor(editorRows, editorType, columnCount, objectColumns)
        if (newValue !== null) {
          contentToSave = formatModuleValue(newValue)
        }
      }

      await window.api.writeCustomFile({
        id: datasetId,
        file: selectedFile,
        content: contentToSave
      })

      setRawContent(contentToSave)
      setHasChanges(false)
      addToast('settings.files.saved')
      refreshReferenceTypes()
    } catch (err) {
      console.error('Unable to save file', err)
      setFileError('settings.files.errors.save')
    } finally {
      setIsSavingFile(false)
    }
  }

  const renderEditor = () => {
    if (!selectedFile) {
      if (filesLoading) {
        return (
          <p>
            <TextItem path="settings.files.loading" />
          </p>
        )
      }

      if (files.length === 0) {
        return (
          <p>
            <TextItem path="settings.editor.no_files" />
          </p>
        )
      }

      return (
        <p>
          <TextItem path="settings.files.select_file_prompt" />
        </p>
      )
    }

    if (isFileLoading) {
      return (
        <p>
          <TextItem path="settings.files.loading" />
        </p>
      )
    }

    if (editorType === 'unknown') {
      return (
        <>
          <p>
            <TextItem path="settings.editor.raw_helper" />
          </p>
          <textarea
            className="settings-raw-editor"
            value={rawContent}
            onChange={(e) => handleRawChange(e.target.value)}
            rows={20}
          />
        </>
      )
    }

    const effectiveColumnCount =
      editorType === 'object-array'
        ? Math.max(objectColumns.length, 1)
        : columnCount || (editorType === 'array' ? 1 : DEFAULT_COLUMNS)

    return (
      <>
        <div className="settings-grid-actions">
          <div>
            {editorType !== 'table' && (
              <button type="button" onClick={handleAddRow}>
                <TextItem path="settings.files.actions.add_row" />
              </button>
            )}
          </div>
          <div>
            <button type="button" onClick={handleReloadFile}>
              <TextItem path="settings.files.actions.reload_file" />
            </button>
            <button type="button" onClick={handleSaveFile} disabled={!hasChanges || isSavingFile}>
              {isSavingFile ? (
                <TextItem path="settings.files.actions.saving" />
              ) : (
                <TextItem path="settings.files.actions.save" />
              )}
            </button>
          </div>
        </div>

        <div className="settings-grid-wrapper">
          <table className="settings-data-table">
            <thead>
              <tr>
                {editorType === 'table' && (
                  <th>
                    <TextItem path="settings.editor.key" />
                  </th>
                )}
                {editorType === 'object-array'
                  ? Array.from({ length: effectiveColumnCount }).map((_, index) => (
                      <th key={`col-${index}`}>
                        <input
                          type="text"
                          value={objectColumns[index] || ''}
                          readOnly
                          disabled
                          placeholder={translate('settings.editor.field_placeholder')}
                        />
                      </th>
                    ))
                  : Array.from({ length: columnCount }).map((_, index) => (
                      <th key={`col-${index}`}>
                        <TextItem path="settings.editor.col" /> {index + 1}
                      </th>
                    ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {editorRows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {editorType === 'table' && (
                    <td>
                      <span className="settings-table-key">{row.key || ''}</span>
                    </td>
                  )}
                  {(editorType === 'object-array'
                    ? Array.from({ length: effectiveColumnCount })
                    : Array.from({ length: columnCount })
                  ).map((_, columnIndex) => (
                    <td key={`cell-${rowIndex}-${columnIndex}`}>
                      <input
                        type={editorType === 'object-array' ? 'text' : 'number'}
                        step="0.001"
                        value={row.values[columnIndex] || ''}
                        onChange={(e) => handleCellChange(rowIndex, columnIndex, e.target.value)}
                      />
                    </td>
                  ))}
                  <td>
                    <button type="button" onClick={() => handleRemoveRow(rowIndex)}>
                      <TextItem path="settings.files.actions.remove_row" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  const selectedSetLabel = dataset?.label || datasetId

  return (
    <div className="settings-page">
      <button type="button" onClick={() => navigate('/settings')}>
        <TextItem path="settings.editor.back" />
      </button>

      <h1>
        <TextItem path="settings.editor.title" /> - {selectedSetLabel}
      </h1>

      {fileError && (
        <div className="error-message">
          <TextItem path={fileError} />
        </div>
      )}

      <section>
        <div className="settings-editor">
          <div className="settings-editor-sidebar">
            <div className="settings-editor-header">
              <strong>{selectedSetLabel}</strong>
              <button type="button" onClick={loadFiles}>
                <TextItem path="settings.files.actions.refresh" />
              </button>
            </div>
            <div className="settings-files-list">
              {filesLoading ? (
                <p>
                  <TextItem path="settings.files.loading" />
                </p>
              ) : files.length === 0 ? (
                <p>
                  <TextItem path="settings.editor.no_files" />
                </p>
              ) : (
                <>
                  <p className="settings-files-title">
                    <TextItem path="settings.editor.files_title" />
                  </p>
                  <ul>
                    {files.map((file) => (
                      <li key={file.name}>
                        <button
                          type="button"
                          className={selectedFile === file.name ? 'active' : ''}
                          onClick={() => handleSelectFile(file.name)}
                        >
                          {file.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
          <div className="settings-editor-content">{renderEditor()}</div>
        </div>
      </section>
    </div>
  )
}

export default SettingsEditor
