import constants from '@renderer/constants'
import { useAppReferenceTypes } from '@renderer/providers/AppProvider'
import { format, isValid } from 'date-fns'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from './textItem'
import getIndicativeAmount from '@renderer/helpers/getIndicativeAmount'
import { useGeneralInfo } from '@renderer/hooks/generalInfo'
import { FaCheck, FaTimes } from 'react-icons/fa'

const ReferenceInput = ({ options, onChange, value }) => {
  const referenceOptions = useAppReferenceTypes() || constants.reference_type || []
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

  const allOptionsZero = useMemo(() => {
    const values = (options || []).map((option) => parseFloat(option?.value as any) || 0)
    return values.length > 0 && values.every((value) => value === 0)
  }, [options])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {allOptionsZero ? (
        <span style={{ color: '#ff5d5d', fontSize: 12 }}>
          {translate('errors.salary_options_zero')}
        </span>
      ) : (
        <select {...field} style={{ maxWidth: '100%' }}>
          {!noSelect && <option value={''}>Select</option>}
          {(options || [])?.map((it, key) => (
            <option key={key} value={it?.value}>
              {translate(it?.label || it?.value)}
            </option>
          ))}
        </select>
      )}
    </div>
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
  salaryType,
  onValueChange,
  onChange: customOnChange,
  switchOnLabel = 'common.activate',
  switchOffLabel = 'common.deactivate'
}) => {
  const translate = useTranslation()
  const referenceOptions = useAppReferenceTypes() || constants.reference_type || []
  const preventNumberScroll = useCallback((event) => {
    event.currentTarget.blur()
  }, [])

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

      if (type === 'checkbox') {
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {val ? <FaCheck /> : <FaTimes />}
          </div>
        )
      }

      if (type === 'switch') {
        return translate(val ? switchOnLabel : switchOffLabel)
      }

      return val
    },
    [type, options, style, translate, referenceOptions]
  )

  const renderInput = useCallback(
    (field) => {
      const sharedInputProps =
        type === 'number'
          ? {
              onWheel: preventNumberScroll
            }
          : {}

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
          <select
            {...field}
            style={{ maxWidth: '100%' }}
            onChange={(event) => {
              field.onChange(event)
              customOnChange?.(event.target.value, event)
              onValueChange?.(event.target.value, event)
            }}
          >
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

      if (type === 'checkbox') {
        const { value, onChange, ...rest } = field
        return (
          <input
            {...rest}
            type="checkbox"
            checked={!!value}
            onChange={(event) => {
              const checked = event.target.checked
              onChange(checked)
              customOnChange?.(checked, event)
              onValueChange?.(checked, event)
            }}
          />
        )
      }

      if (type === 'switch') {
        const { value, onChange, ...rest } = field
        return (
          <span className="field-switch">
            <input
              {...rest}
              type="checkbox"
              checked={!!value}
              onChange={(event) => {
                const checked = event.target.checked
                onChange(checked)
                customOnChange?.(checked, event)
                onValueChange?.(checked, event)
              }}
            />
            <span className="field-switch__highlight" aria-hidden="true" />
            <span className="field-switch__option field-switch__option--on">
              {translate(switchOnLabel)}
            </span>
            <span className="field-switch__option field-switch__option--off">
              {translate(switchOffLabel)}
            </span>
          </span>
        )
      }

      return children({ ...field, type, ...sharedInputProps })
    },
    [
      children,
      type,
      noSelect,
      options,
      style,
      translate,
      salaryType,
      onValueChange,
      customOnChange,
      switchOnLabel,
      switchOffLabel,
      preventNumberScroll
    ]
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
