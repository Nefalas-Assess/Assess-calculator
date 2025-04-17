import { format, isValid } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'

const ReferenceInput = ({ options, onChange, value }) => {
  const [value1, setValue1] = useState('')
  const [value2, setValue2] = useState('')

  useEffect(() => {
    if (value1) {
      if (value2) {
        onChange(value1 + '_' + value2)
      } else if (!options) {
        onChange(value1)
      }
    }
  }, [value1, value2, options])

  useEffect(() => {
    if (value) {
      const splitted = value.split('_')
      setValue1(splitted[0] + '_' + splitted[1])
      setValue2(splitted?.slice(2).join('_'))
    }
  }, [value])

  return (
    <>
      <select value={value1} onChange={(e) => setValue1(e.target.value)}>
        <option value={''}>Select</option>
        <option value={'schryvers_2024'}>Schryvers 2024</option>
        <option value={'schryvers_2025'}>Schryvers 2025</option>
      </select>
      {options && (
        <select
          value={value2}
          onChange={(e) => setValue2(e.target.value)}
          style={{ maxWidth: '100%' }}
        >
          <option value={''}>Select</option>
          {(options || [])?.map((it, key) => (
            <option key={key} value={it?.value}>
              {it?.label || it?.value}
            </option>
          ))}
        </select>
      )}
    </>
  )
}

const Field = ({ editable, name, type, children, control, options, style }) => {
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

      if (type === 'textarea') {
        return <div style={style}>{val}</div>
      }

      return val
    },
    [type]
  )

  const renderInput = useCallback(
    (field) => {
      if (type === 'reference') {
        return (
          <>
            <input style={{ display: 'none' }} {...field} />
            <ReferenceInput
              options={options}
              onChange={field.onChange}
              value={field.value} // Pass the initial value from the field
            />
          </>
        )
      }

      if (type === 'select' && options) {
        return (
          <select {...field} style={{ maxWidth: '100%' }}>
            <option value={''}>Select</option>
            {(options || [])?.map((it, key) => (
              <option key={key} value={it?.value}>
                {it?.label || it?.value}
              </option>
            ))}
          </select>
        )
      }

      if (type === 'textarea') {
        return <textarea style={style} {...field} />
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
