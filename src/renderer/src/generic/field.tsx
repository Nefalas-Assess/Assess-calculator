import { format } from 'date-fns'
import { useCallback } from 'react'
import { Controller } from 'react-hook-form'

const Field = ({ editable, name, type, children, control }) => {
  const renderValue = useCallback(
    (val) => {
      if (type === 'date') {
        return format(val, 'dd/MM/yyyy')
      }
      return val
    },
    [type]
  )

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        return !editable ? renderValue(field?.value) : children({ ...field, type })
      }}
    />
  )
}

export default Field
