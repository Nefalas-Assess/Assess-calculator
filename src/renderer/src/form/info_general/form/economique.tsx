import React, { useEffect, useRef, useState } from 'react'
import Field from '@renderer/generic/field'
import TextItem from '@renderer/generic/textItem'
import { useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'

type EconomiqueSectionProps = {
  control: any
  editable: boolean
  setValue: (name: string, value: any) => void
}

const EconomiqueSection: React.FC<EconomiqueSectionProps> = ({ control, editable, setValue }) => {
  const economiqueValues = useWatch({
    control,
    name: 'economique'
  })

  const [isEditingMonthly, setIsEditingMonthly] = useState(false)
  const [isEditingYearly, setIsEditingYearly] = useState(false)
  const [isEditingNetMonthly, setIsEditingNetMonthly] = useState(false)
  const [isEditingNetYearly, setIsEditingNetYearly] = useState(false)
  const lastCalculatedRef = useRef<{ monthly?: number; yearly?: number }>({})
  const lastNetCalculatedRef = useRef<{ monthly?: number; yearly?: number }>({})

  const handleEditMonthly = () => {
    setIsEditingMonthly(!isEditingMonthly)
  }

  const handleEditYearly = () => {
    setIsEditingYearly(!isEditingYearly)
  }

  const handleEditNetMonthly = () => {
    setIsEditingNetMonthly(!isEditingNetMonthly)
  }

  const handleEditNetYearly = () => {
    setIsEditingNetYearly(!isEditingNetYearly)
  }

  useEffect(() => {
    const parseNumber = (value: any) => {
      const parsed = parseFloat(value)
      return Number.isNaN(parsed) ? undefined : parsed
    }

    const dayValue = parseNumber(economiqueValues?.brut?.day)

    if (dayValue === undefined) {
      return
    }

    const yearly = parseFloat((dayValue * 365).toFixed(2))
    const monthly = parseFloat((yearly / 12).toFixed(2))

    const currentMonthly = parseNumber(economiqueValues?.brut?.monthly)
    const currentYearly = parseNumber(economiqueValues?.brut?.yearly)

    const monthlyWasAuto =
      currentMonthly !== undefined &&
      lastCalculatedRef.current.monthly !== undefined &&
      currentMonthly === lastCalculatedRef.current.monthly
    const yearlyWasAuto =
      currentYearly !== undefined &&
      lastCalculatedRef.current.yearly !== undefined &&
      currentYearly === lastCalculatedRef.current.yearly

    const shouldUpdateMonthly =
      !isEditingMonthly && (currentMonthly === undefined || monthlyWasAuto)
    const shouldUpdateYearly = !isEditingYearly && (currentYearly === undefined || yearlyWasAuto)

    if (shouldUpdateMonthly && currentMonthly !== monthly) {
      setValue('economique.brut.monthly', monthly)
    }

    if (shouldUpdateYearly && currentYearly !== yearly) {
      setValue('economique.brut.yearly', yearly)
    }

    lastCalculatedRef.current = { monthly, yearly }
  }, [economiqueValues?.brut?.day, setValue])

  useEffect(() => {
    const parseNumber = (value: any) => {
      const parsed = parseFloat(value)
      return Number.isNaN(parsed) ? undefined : parsed
    }

    const dayValue = parseNumber(economiqueValues?.net?.day)

    if (dayValue === undefined) {
      return
    }

    const yearly = parseFloat((dayValue * 365).toFixed(2))
    const monthly = parseFloat((yearly / 12).toFixed(2))

    const currentMonthly = parseNumber(economiqueValues?.net?.monthly)
    const currentYearly = parseNumber(economiqueValues?.net?.yearly)

    const monthlyWasAuto =
      currentMonthly !== undefined &&
      lastNetCalculatedRef.current.monthly !== undefined &&
      currentMonthly === lastNetCalculatedRef.current.monthly
    const yearlyWasAuto =
      currentYearly !== undefined &&
      lastNetCalculatedRef.current.yearly !== undefined &&
      currentYearly === lastNetCalculatedRef.current.yearly

    const shouldUpdateMonthly =
      !isEditingNetMonthly && (currentMonthly === undefined || monthlyWasAuto)
    const shouldUpdateYearly = !isEditingNetYearly && (currentYearly === undefined || yearlyWasAuto)

    if (shouldUpdateMonthly && currentMonthly !== monthly) {
      setValue('economique.net.monthly', monthly)
    }

    if (shouldUpdateYearly && currentYearly !== yearly) {
      setValue('economique.net.yearly', yearly)
    }

    lastNetCalculatedRef.current = { monthly, yearly }
  }, [economiqueValues?.net?.day, setValue])

  if (!editable) {
    return null
  }

  return (
    <div style={{ marginTop: 20 }}>
      <TextItem path="info_general.economique_table.title" tag="h3" />
      <table style={{ maxWidth: 600 }} className={editable ? 'main-table' : ''}>
        <tbody>
          <tr>
            <TextItem path="info_general.economique_table.brut.day" tag="td" />
            <td>
              <Field control={control} name="economique.brut.day" editable={editable}>
                {(props) => (
                  <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                )}
              </Field>
            </td>
          </tr>
          <tr>
            <TextItem path="info_general.economique_table.brut.monthly" tag="td" />
            <td>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                {!isEditingMonthly ? (
                  <Money value={economiqueValues?.brut?.monthly || 0} ignore span />
                ) : (
                  <Field
                    control={control}
                    name="economique.brut.monthly"
                    editable={editable && isEditingMonthly}
                  >
                    {(props) => (
                      <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                    )}
                  </Field>
                )}
                <button style={{ margin: 0 }} type="button" onClick={handleEditMonthly}>
                  <TextItem path={isEditingMonthly ? 'common.save' : 'common.edit'} />
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <TextItem path="info_general.economique_table.brut.yearly" tag="td" />
            <td>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                {!isEditingYearly ? (
                  <Money value={economiqueValues?.brut?.yearly || 0} ignore span />
                ) : (
                  <Field
                    control={control}
                    name="economique.brut.yearly"
                    editable={editable && isEditingYearly}
                  >
                    {(props) => (
                      <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                    )}
                  </Field>
                )}
                <button style={{ margin: 0 }} type="button" onClick={handleEditYearly}>
                  <TextItem path={isEditingYearly ? 'common.save' : 'common.edit'} />
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <TextItem path="info_general.economique_table.net.day" tag="td" />
            <td>
              <Field control={control} name="economique.net.day" editable={editable}>
                {(props) => (
                  <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                )}
              </Field>
            </td>
          </tr>
          <tr>
            <TextItem path="info_general.economique_table.net.monthly" tag="td" />
            <td>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                {!isEditingNetMonthly ? (
                  <Money value={economiqueValues?.net?.monthly || 0} ignore span />
                ) : (
                  <Field
                    control={control}
                    name="economique.net.monthly"
                    editable={editable && isEditingNetMonthly}
                  >
                    {(props) => (
                      <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                    )}
                  </Field>
                )}
                <button style={{ margin: 0 }} type="button" onClick={handleEditNetMonthly}>
                  <TextItem path={isEditingNetMonthly ? 'common.save' : 'common.edit'} />
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <TextItem path="info_general.economique_table.net.yearly" tag="td" />
            <td>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                {!isEditingNetYearly ? (
                  <Money value={economiqueValues?.net?.yearly || 0} ignore span />
                ) : (
                  <Field
                    control={control}
                    name="economique.net.yearly"
                    editable={editable && isEditingNetYearly}
                  >
                    {(props) => (
                      <input type="number" step="0.01" min="0" style={{ width: 200 }} {...props} />
                    )}
                  </Field>
                )}
                <button style={{ margin: 0 }} type="button" onClick={handleEditNetYearly}>
                  <TextItem path={isEditingNetYearly ? 'common.save' : 'common.edit'} />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default EconomiqueSection
