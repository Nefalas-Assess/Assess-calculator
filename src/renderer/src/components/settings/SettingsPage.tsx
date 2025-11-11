import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import TextItem, { useTranslation } from '@renderer/generic/textItem'
import { AppContext } from '@renderer/providers/AppProvider'
import { useToast } from '@renderer/providers/ToastProvider'

type CustomReference = {
  id: string
  label: string
  meta?: {
    createdAt?: string
    source?: string
  }
}

type TemplateReference = {
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

const evaluateModuleValue = (content: string) => {
  try {
    const sanitized = sanitizeModuleContent(content)
    if (!sanitized) return undefined
    // eslint-disable-next-line no-new-func
    return new Function(`return (${sanitized});`)()
  } catch (error) {
    console.error('Unable to evaluate custom file', error)
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
    // Fallback: still treat as matrix so we can render a grid
    return 'matrix'
  }

  if (isPlainObject(value)) {
    const entries = Object.values(value || {})
    if (entries.length === 0) return 'table'
    if (entries.every((row) => Array.isArray(row))) {
      return 'table'
    }
    // Fallback: treat as table even if some values are not arrays
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

const nextRowKey = (rows: EditorRow[]) => {
  const numericKeys = rows
    .map((row) => Number.parseInt(row.key || '', 10))
    .filter((value) => Number.isFinite(value))
  const candidate = numericKeys.length ? Math.max(...numericKeys) + 1 : rows.length
  const asString = candidate.toString()
  if (rows.some((row) => row.key === asString)) {
    return `row_${rows.length + 1}`
  }
  return asString
}

const SettingsPage = () => {
  const { refreshReferenceTypes } = useContext(AppContext)
  const { addToast } = useToast()
  const translate = useTranslation()

  const [customSets, setCustomSets] = useState<CustomReference[]>([])
  const [templates, setTemplates] = useState<TemplateReference[]>([])
  const [form, setForm] = useState({ id: '', label: '', source: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedSet, setSelectedSet] = useState<CustomReference | null>(null)
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

  const orderedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => a.id.localeCompare(b.id))
  }, [templates])

  const loadSets = useCallback(async () => {
    try {
      const [custom, templateList] = await Promise.all([
        window.api.listCustomReferences?.(),
        window.api.listReferenceTemplates?.()
      ])

      setCustomSets(custom || [])
      setTemplates(templateList || [])
      setForm((prev) => ({
        ...prev,
        source: prev.source || templateList?.[0]?.id || 'Blank'
      }))
    } catch (err) {
      console.error('Unable to load settings data', err)
      setError('settings.errors.load')
    }
  }, [])

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

  const loadFiles = useCallback(
    async (setId: string) => {
      try {
        setFilesLoading(true)
        const response = await window.api.listCustomFiles?.(setId)
        setFiles(response || [])
      } catch (err) {
        console.error('Unable to list files', err)
        setFileError('settings.files.errors.load')
      } finally {
        setFilesLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    loadSets()
  }, [loadSets])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.id || !/^[a-zA-Z0-9_-]+$/.test(form.id)) {
      setError('settings.errors.invalid_id')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await window.api.createCustomReference({
        id: form.id,
        label: form.label || form.id,
        source: form.source || 'Blank'
      })
      await loadSets()
      await refreshReferenceTypes()
      setForm({ id: '', label: '', source: form.source })
      addToast('settings.success.created')
    } catch (err) {
      console.error('Unable to create custom set', err)
      setError('settings.errors.create')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageSet = async (customSet: CustomReference) => {
    setSelectedSet(customSet)
    setFiles([])
    resetEditor()
    await loadFiles(customSet.id)
  }

  const handleSelectFile = async (fileName: string) => {
    if (!selectedSet) return

    setSelectedFile(fileName)
    setFileError(null)
    setEditorType(null)
    setEditorRows([])
    setColumnCount(DEFAULT_COLUMNS)
    setHasChanges(false)

    try {
      setIsFileLoading(true)
      const content = await window.api.readCustomFile({
        id: selectedSet.id,
        file: fileName
      })
      setRawContent(content)
      const value = evaluateModuleValue(content)
      const type = detectEditorType(value)
      if (type === 'unknown') {
        setEditorType('unknown')
        setObjectColumns([])
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
        return [...prev, { key: nextRowKey(prev), values: padValues([], columnCount) }]
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

  const handleAddColumn = () => {
    if (editorType === 'object-array') {
      const nextName = `field_${objectColumns.length + 1}`
      const nextColumns = [...objectColumns, nextName]
      setObjectColumns(nextColumns)
      setColumnCount(nextColumns.length)
      setEditorRows((prev) =>
        prev.map((row) => ({
          ...row,
          values: padValues(row.values, nextColumns.length)
        }))
      )
    } else {
      const nextCount = columnCount + 1
      setColumnCount(nextCount)
      setEditorRows((prev) =>
        prev.map((row) => ({
          ...row,
          values: padValues(row.values, nextCount)
        }))
      )
    }
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

  const handleRowKeyChange = (rowIndex: number, value: string) => {
    setEditorRows((prev) =>
      prev.map((row, index) => {
        if (index !== rowIndex) return row
        return { ...row, key: value }
      })
    )
    setHasChanges(true)
  }

  const handleObjectColumnChange = (columnIndex: number, value: string) => {
    setObjectColumns((prev) => {
      const next = [...prev]
      next[columnIndex] = value || `field_${columnIndex + 1}`
      return next
    })
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
    if (!selectedSet || !selectedFile) return

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
        id: selectedSet.id,
        file: selectedFile,
        content: contentToSave
      })

      setRawContent(contentToSave)
      setHasChanges(false)
      addToast('settings.files.saved')
    } catch (err) {
      console.error('Unable to save file', err)
      setFileError('settings.files.errors.save')
    } finally {
      setIsSavingFile(false)
    }
  }

  const renderEditor = () => {
    if (!selectedSet) {
      return (
        <p>
          <TextItem path="settings.editor.subtitle_no_set" />
        </p>
      )
    }

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
            {editorType === 'table' && (
              <button type="button" onClick={handleAddRow}>
                <TextItem path="settings.files.actions.add_row" />
              </button>
            )}
            {editorType !== 'array' && (
              <button type="button" onClick={handleAddColumn}>
                <TextItem path="settings.files.actions.add_column" />
              </button>
            )}
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
                          onChange={(e) => handleObjectColumnChange(index, e.target.value)}
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
                      <input
                        type="text"
                        value={row.key || ''}
                        onChange={(e) => handleRowKeyChange(rowIndex, e.target.value)}
                      />
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

  return (
    <div className="settings-page">
      <h1>
        <TextItem path="settings.title" />
      </h1>

      <section>
        <h2>
          <TextItem path="settings.custom_sets.title" />
        </h2>

        {customSets.length === 0 ? (
          <p>
            <TextItem path="settings.custom_sets.empty" />
          </p>
        ) : (
          <ul className="settings-custom-list">
            {customSets.map((set) => (
              <li key={set.id} className="settings-custom-item">
                <div>
                  <strong>{set.label}</strong> ({set.id})
                  {set.meta?.source && (
                    <span>
                      {' '}
                      <TextItem path="settings.custom_sets.from" /> {set.meta.source}
                    </span>
                  )}
                  {set.meta?.createdAt && (
                    <span>
                      {' '}
                      <TextItem path="settings.custom_sets.created" />{' '}
                      {new Date(set.meta.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button type="button" onClick={() => handleManageSet(set)}>
                  <TextItem path="settings.custom_sets.manage" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>
          <TextItem path="settings.create.title" />
        </h2>

        {error && (
          <div className="error-message">
            <TextItem path={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="settings-form">
          <label>
            <span>
              <TextItem path="settings.create.id" />
            </span>
            <input
              type="text"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value.trim() })}
              required
              pattern="^[a-zA-Z0-9_-]+$"
            />
          </label>

          <label>
            <span>
              <TextItem path="settings.create.label" />
            </span>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </label>

          <label>
            <span>
              <TextItem path="settings.create.template" />
            </span>
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            >
              {orderedTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <TextItem path="settings.create.loading" />
            ) : (
              <TextItem path="settings.create.submit" />
            )}
          </button>
        </form>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>
          <TextItem path="settings.editor.title" />
        </h2>
        {fileError && (
          <div className="error-message">
            <TextItem path={fileError} />
          </div>
        )}

        <div className="settings-editor">
          <div className="settings-editor-sidebar">
            <div className="settings-editor-header">
              <strong>
                {selectedSet ? (
                  <>
                    <TextItem path="settings.editor.subtitle_set" /> {selectedSet.label}
                  </>
                ) : (
                  <TextItem path="settings.editor.subtitle_no_set" />
                )}
              </strong>
              {selectedSet && (
                <button type="button" onClick={() => loadFiles(selectedSet.id)}>
                  <TextItem path="settings.files.actions.refresh" />
                </button>
              )}
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

export default SettingsPage
