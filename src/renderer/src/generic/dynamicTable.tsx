import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { useFieldArray, useForm, useWatch, Control } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import Field from '@renderer/generic/field'
import { getDays, getMedDate } from '@renderer/helpers/general'

// Define column types
type ColumnType = {
  header: string
  key: string
  type?: 'date' | 'number' | 'select' | 'text' | 'calculated' | 'interest'
  width?: number
  className?: string
  options?: { value: string | number; label: string }[]
  render?: (value: any, rowData: any, index: number) => React.ReactNode
  props?: Record<string, any>
}

type DynamicTableProps = {
  title: string
  columns: ColumnType[]
  control: Control<any>
  name: string
  formValues: any
  editable?: boolean
  onAddRow?: (append: Function) => void
  addRowLabel?: string
  addRowDefaults?: Record<string, any>
  calculateTotal?: (values: any, days: number) => string
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  title,
  columns,
  control,
  name,
  formValues,
  editable = true,
  onAddRow,
  addRowLabel = 'Ajouter une ligne',
  addRowDefaults = {},
  calculateTotal
}) => {
  const { fields, remove, append } = useFieldArray({
    control,
    name
  })

  const addNext = useCallback(
    (append, initial = {}) => {
      const rows = formValues?.[name] || []
      const lastRowEnd = rows[rows.length - 1]?.end

      if (lastRowEnd) {
        const finDate = new Date(lastRowEnd)
        if (!isNaN(finDate)) {
          finDate.setDate(finDate.getDate() + 1) // Add 1 day to previous end date
          append({ start: finDate.toISOString().split('T')[0], ...initial })
        }
      } else {
        append({ ...initial })
      }
    },
    [formValues, name]
  )

  const handleAddRow = useCallback(() => {
    if (onAddRow) {
      onAddRow(append)
    } else {
      addNext(append, addRowDefaults)
    }
  }, [append, addNext, onAddRow, addRowDefaults])

  return (
    <div>
      <h1>{title}</h1>
      <table style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            {columns.map((column, idx) => (
              <th key={idx} className={column.className}>
                {column.header}
              </th>
            ))}
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {fields.map((field, rowIndex) => {
            const rowData = formValues?.[name]?.[rowIndex] || {}
            const daysVar1 = columns.find((c) => c.type === 'start')?.key
            const daysVar2 = columns.find((c) => c.type === 'end')?.key
            const days = getDays(rowData, [daysVar1, daysVar2])
            const total = calculateTotal ? calculateTotal(rowData, days) : '0.00'

            return (
              <tr key={field.id}>
                {columns.map((column, colIndex) => {
                  const fieldName = `${name}.${rowIndex}.${column.key}`

                  // Handle different column types
                  if (column.type === 'calculated' && column.key === 'days') {
                    return (
                      <td key={colIndex} style={column.width ? { width: column.width } : undefined}>
                        {days}
                      </td>
                    )
                  }

                  if (column.type === 'calculated' && column.key === 'total') {
                    return (
                      <td key={colIndex}>
                        <Money value={total} />
                      </td>
                    )
                  }

                  if (column.type === 'interest') {
                    return (
                      <td key={colIndex} className={column.className}>
                        <Interest
                          amount={total}
                          start={column.median ? getMedDate(rowData) : rowData[daysVar1]}
                          end={rowData?.date_paiement}
                        />
                      </td>
                    )
                  }

                  if (column.render) {
                    return (
                      <td key={colIndex}>
                        {column.render(rowData[column.key], rowData, rowIndex)}
                      </td>
                    )
                  }

                  const typeInput =
                    column.type === 'start' ? 'date' : column.type === 'end' ? 'date' : column.type

                  return (
                    <td
                      className={column.className}
                      key={colIndex}
                      style={column.width ? { width: column.width } : undefined}
                    >
                      <Field
                        control={control}
                        type={typeInput || 'text'}
                        name={fieldName}
                        editable={editable}
                      >
                        {(props) => {
                          if (typeInput === 'select') {
                            return (
                              <select {...props} {...column.props}>
                                <option>Select</option>
                                {column.options?.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )
                          }
                          return <input {...props} {...column.props} />
                        }}
                      </Field>
                    </td>
                  )
                })}

                {editable && (
                  <td>
                    <button type="button" onClick={() => remove(rowIndex)}>
                      Supprimer
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {editable && (
        <button type="button" onClick={handleAddRow}>
          {addRowLabel}
        </button>
      )}
    </div>
  )
}

export default DynamicTable
