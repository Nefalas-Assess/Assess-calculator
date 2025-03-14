import { format, isValid } from 'date-fns'
import { useCallback } from 'react'
import { Controller } from 'react-hook-form'

const Field = ({ editable, name, type, children, control, options }) => {
  const renderValue = useCallback(
    (val) => {
      if (type === 'date') {
        if (val) {
          const date = new Date(val)
          return isValid(date) ? format(date, 'dd/MM/yyyy') : '-'
        }
      }

      if (type === 'select') {
        if (val?.toString() && options) {
          return (options || [])?.find((e) => e?.value === val || e?.value?.toString() === val)
            ?.label
        }
      }

      return val
    },
    [type]
  )

  const renderInput = useCallback(
    (field) => {
      if (type === 'select' && options) {
        return (
          <select {...field}>
            <option>Select</option>
            {(options || [])?.map((it, key) => (
              <option key={key} value={it?.value}>
                {it?.label || it?.value}
              </option>
            ))}
          </select>
        )
      }

      return children({ ...field, type })
    },
    [children, type]
  )

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        return !editable ? renderValue(field?.value) : renderInput(field)
      }}
    />
  )
}

export default Field
