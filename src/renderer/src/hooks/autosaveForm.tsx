import { useEffect, useRef } from 'react'

type UseAutosaveFormProps = {
  values: unknown
  handleSubmit: (callback: (values: any) => void) => () => void
  onSubmit: (values: any) => void
  delay?: number
  enabled?: boolean
}

export const useAutosaveForm = ({
  values,
  handleSubmit,
  onSubmit,
  delay = 0,
  enabled = true
}: UseAutosaveFormProps) => {
  const previousSerializedRef = useRef<string | null>(null)

  useEffect(() => {
    const submitIfNeeded = () => {
      if (!enabled) return

      const serializedValues = JSON.stringify(values ?? null)
      if (serializedValues === previousSerializedRef.current) return

      previousSerializedRef.current = serializedValues
      handleSubmit(onSubmit)()
    }

    const timeoutId = window.setTimeout(submitIfNeeded, delay)
    return () => window.clearTimeout(timeoutId)
  }, [values, enabled, handleSubmit, onSubmit, delay])
}

export default useAutosaveForm
