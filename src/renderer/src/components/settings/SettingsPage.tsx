import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import TextItem from '@renderer/generic/textItem'
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

const SettingsPage = () => {
  const { refreshReferenceTypes } = useContext(AppContext)
  const { addToast } = useToast()

  const [customSets, setCustomSets] = useState<CustomReference[]>([])
  const [templates, setTemplates] = useState<TemplateReference[]>([])
  const [form, setForm] = useState({ id: '', label: '', source: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    loadSets()
  }, [loadSets])

  const orderedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => a.id.localeCompare(b.id))
  }, [templates])

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
          <ul>
            {customSets.map((set) => (
              <li key={set.id}>
                <strong>{set.label}</strong> ({set.id})
                {set.meta?.source && (
                  <span style={{ marginLeft: 8 }}>
                    <TextItem path="settings.custom_sets.from" /> {set.meta.source}
                  </span>
                )}
                {set.meta?.createdAt && (
                  <span style={{ marginLeft: 8 }}>
                    <TextItem path="settings.custom_sets.created" />{' '}
                    {new Date(set.meta.createdAt).toLocaleDateString()}
                  </span>
                )}
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
    </div>
  )
}

export default SettingsPage
