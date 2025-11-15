import constants from '@renderer/constants'
import { AppContext } from '@renderer/providers/AppProvider'
import { format, isValid } from 'date-fns'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from './textItem'
import getIndicativeAmount from '@renderer/helpers/getIndicativeAmount'
import { useGeneralInfo } from '@renderer/hooks/generalInfo'

const ReferenceInput = ({ options, onChange, value }) => {
  const appContext = useContext(AppContext)
  const referenceOptions = appContext?.referenceTypes || constants.reference_type || []
  const [value1, setValue1] = useState('')
  const [value2, setValue2] = useState('')

  const translate = useTranslation()

  useEffect(() => {
    if (value1 && ((options && value !== value1 + '_' + value2) || (!options && !value))) {
      if (value2) {
        onChange(value1 + '_' + value2)
      } else if (!options) {
        onChange(value1)
      }
    }
  }, [value1, value2, options, value])

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
        {(referenceOptions || [])?.map((it, key) => (
          <option key={key} value={it?.value}>
            {translate(it?.label || it?.value)}
          </option>
        ))}
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
              {translate(it?.label || it?.value)}
            </option>
          ))}
        </select>
      )}
    </>
  )
}

const SalaryInput = ({ noSelect, field, salaryType }) => {
  const translate = useTranslation()
  const generalInfo = useGeneralInfo()

  const netConsoOptions = useMemo(() => {
    const netEconomique = generalInfo?.economique?.net || {}

    const options = [
      {
        label: 'info_general.economique_table.net.day',
        value: getIndicativeAmount(netEconomique?.day, 0)
      },
      {
        label: 'info_general.economique_table.net.monthly',
        value: getIndicativeAmount(netEconomique?.monthly, 0)
      },
      {
        label: 'info_general.economique_table.net.yearly',
        value: getIndicativeAmount(netEconomique?.yearly, 0)
      }
    ]

    return options
  }, [generalInfo])

  const brutConsoOptions = useMemo(() => {
    const brutEconomique = generalInfo?.economique?.brut || {}

    const options = [
      {
        label: 'info_general.economique_table.brut.day',
        value: getIndicativeAmount(brutEconomique?.day, 0)
      },
      {
        label: 'info_general.economique_table.brut.monthly',
        value: getIndicativeAmount(brutEconomique?.monthly, 0)
      },
      {
        label: 'info_general.economique_table.brut.yearly',
        value: getIndicativeAmount(brutEconomique?.yearly, 0)
      }
    ]

    return options
  }, [generalInfo])

  const options = useMemo(() => {
    if (salaryType === 'net') {
      return netConsoOptions
    }
    if (salaryType === 'yearly') {
      return [...netConsoOptions, ...brutConsoOptions]?.filter(
        (it) =>
          it?.value === getIndicativeAmount(generalInfo?.economique?.net?.yearly, 0) ||
          it?.value === getIndicativeAmount(generalInfo?.economique?.brut?.yearly, 0)
      )
    }
    if (salaryType === 'mix') {
      return [...netConsoOptions, ...brutConsoOptions]
    }
    return brutConsoOptions
  }, [salaryType, netConsoOptions, brutConsoOptions])

  return (
    <select {...field} style={{ maxWidth: '100%' }}>
      {!noSelect && <option value={''}>Select</option>}
      {(options || [])?.map((it, key) => (
        <option key={key} value={it?.value}>
          {translate(it?.label || it?.value)}
        </option>
      ))}
    </select>
  )
}

const Field = ({
  editable,
  name,
  type,
  children,
  control,
  options,
  style,
  noSelect,
  salaryType
}) => {
  const translate = useTranslation()
  const appContext = useContext(AppContext)
  const referenceOptions = appContext?.referenceTypes || constants.reference_type || []

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
          const res = (options || [])?.find(
            (e) => e?.value === val || e?.value?.toString() === val
          )?.label
          return res ? translate(res) : '-'
        }
      }

      if (type === 'textarea') {
        return <div style={style}>{val}</div>
      }

      if (type === 'reference') {
        const ref = (referenceOptions || [])?.find((e) => val?.includes(e?.value))
        const ref2 = (options || [])?.find((e) => e?.value === val?.split(ref?.value + '_')?.[1])

        if (!ref) return '-'

        return `${translate(ref?.label || ref?.value)} ${translate(ref2?.label || ref2?.value || '')}`
      }

      return val
    },
    [type, options, style, translate]
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

      if (type === 'salary') {
        return <SalaryInput noSelect={noSelect} field={field} salaryType={salaryType} />
      }

      if (type === 'select' && options) {
        return (
          <select {...field} style={{ maxWidth: '100%' }}>
            {!noSelect && <option value={''}>Select</option>}
            {(options || [])?.map((it, key) => (
              <option key={key} value={it?.value}>
                {translate(it?.label || it?.value)}
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
    [children, type, noSelect, options, style, translate]
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
