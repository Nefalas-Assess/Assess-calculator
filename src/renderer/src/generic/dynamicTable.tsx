import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { useFieldArray, useForm, useWatch, Control } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import Field from '@renderer/generic/field'
import { getDays, getMedDate } from '@renderer/helpers/general'
import ActionMenuButton from './actionButton'
import Tooltip from './tooltip'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { useCapitalization } from '@renderer/hooks/capitalization'
import CoefficientInfo from './coefficientInfo'
import TextItem, { getTranslation } from './textItem'

// Define column types
type ColumnType = {
  header: string
  key: string
  type?:
    | 'date'
    | 'number'
    | 'select'
    | 'text'
    | 'calculated'
    | 'interest'
    | 'capitalization'
    | 'reference'
  width?: number
  className?: string
  options?: { value: string | number; label: string }[]
  render?: (
    value: Record<string, unknown>,
    rowData: Record<string, unknown>,
    index: number
  ) => React.ReactNode
  props?: Record<string, unknown>
  tooltipContent?: (values: Record<string, unknown>, days: number) => React.ReactNode
  additionalContent?: (values: Record<string, unknown>) => React.ReactNode
}

type DynamicTableProps = {
  title?: string
  subtitle?: string
  columns: ColumnType[]
  control: Control<any>
  name: string
  formValues: Record<string, unknown>
  editable?: boolean
  onAddRow?: (append: Function) => void
  addRowLabel?: string
  addRowDefaults?: Record<string, any>
  calculateTotal?: (values: Record<string, unknown>, days: number) => string
  customActions?: {
    label: string
    actions: { label: string; action: () => void }[]
  }
}

const Capitalization = ({
  values,
  columns,
  columnProps,
  formValues
}: {
  values: Record<string, unknown>
  columns: ColumnType[]
  columnProps: Record<string, unknown>
  formValues: Record<string, unknown>
}): React.ReactNode => {
  const constantsArray =
    columnProps?.refArray || columns?.find((c) => c?.key === columnProps?.index)?.options

  const end =
    (columnProps?.duration
      ? new Date(
          new Date().setFullYear(
            new Date().getFullYear() + parseInt(values?.[columnProps?.duration] || 0) - 1
          )
        )
      : values?.[columnProps?.end]) || columnProps?.end

  const start =
    (columnProps?.duration ? new Date() : values?.[columnProps?.start]) || columnProps?.start

  const index = constantsArray?.findIndex(
    (e) => e?.value === parseFloat(values?.[columnProps?.index] || formValues?.[columnProps?.index])
  )

  const coef = useCapitalization({
    start,
    end,
    ref: values?.[columnProps?.ref] || formValues?.[columnProps?.ref],
    index,
    asObject: true,
    base: columnProps?.base,
    noGender: columnProps?.noGender
  })

  const renderToolTip = useCallback(
    (values) => {
      return (
        <div>
          <math>
            <mn>{values?.[columnProps?.amount] || values?.amount}</mn>
            <mo>x</mo>
            <CoefficientInfo
              table={coef?.table}
              index={coef?.index}
              headers={constantsArray}
              startIndex={1}
            >
              <mn>{coef?.value}</mn>
            </CoefficientInfo>
          </math>
        </div>
      )
    },
    [coef]
  )

  return (
    <Money
      value={(
        parseFloat(values?.[columnProps?.amount] || values?.amount || 0) * (coef?.value || 0)
      ).toFixed(2)}
      tooltip={renderToolTip(values)}
    />
  )
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  title,
  subtitle,
  columns,
  control,
  name,
  formValues,
  editable = true,
  onAddRow,
  addRowLabel = 'common.add_row',
  addRowDefaults = {},
  calculateTotal,
  customActions
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
      {title && <TextItem tag="h1" path={title} />}
      {subtitle && <TextItem tag="h3" path={subtitle} />}
      <table style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            {columns.map((column, idx) => (
              <th key={idx} className={column.className}>
                <TextItem path={column.header} />
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
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Money value={total?.value || total} tooltip={total?.tooltip} />
                          {column?.tooltipContent && (
                            <Tooltip tooltipContent={column?.tooltipContent(rowData, days)}>
                              <FaRegQuestionCircle style={{ marginLeft: 5 }} />
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    )
                  }

                  if (column.type === 'interest') {
                    let start = column.median && rowData ? getMedDate(rowData) : rowData[daysVar1]
                    if (column.props?.start) {
                      start = column.props?.start
                    }

                    return (
                      <td key={colIndex} className={column.className}>
                        <Interest
                          amount={total?.value || total}
                          start={start}
                          end={rowData?.date_paiement}
                        />
                      </td>
                    )
                  }

                  if (column?.type === 'capitalization') {
                    return (
                      <td key={colIndex}>
                        <Capitalization
                          values={rowData}
                          columns={columns}
                          columnProps={column.props}
                          formValues={formValues}
                        />
                      </td>
                    )
                  }

                  if (column.type === 'reference') {
                    return (
                      <td key={colIndex}>
                        <Field
                          control={control}
                          type={column.type}
                          name={fieldName}
                          editable={editable}
                          options={column.options}
                        ></Field>
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
                              <select
                                {...props}
                                style={{ width: column.width || '100%' }}
                                {...column.props}
                              >
                                <option>Select</option>
                                {column.options?.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {getTranslation(option.label)}
                                  </option>
                                ))}
                              </select>
                            )
                          }
                          return (
                            <input {...props} style={{ width: column.width }} {...column.props} />
                          )
                        }}
                      </Field>
                      {column?.additionalContent && column?.additionalContent(rowData)}
                    </td>
                  )
                })}

                {editable && (
                  <td>
                    <button type="button" onClick={() => remove(rowIndex)}>
                      <TextItem path="common.delete" />
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {editable && (
        <div className="buttons-row">
          <button type="button" onClick={handleAddRow}>
            <TextItem path={addRowLabel} />
          </button>
          {customActions && (
            <ActionMenuButton label={customActions?.label} actions={customActions?.actions} />
          )}
        </div>
      )}
    </div>
  )
}

export default DynamicTable
