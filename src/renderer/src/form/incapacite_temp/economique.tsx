import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import { useForm, useWatch } from 'react-hook-form'
import Field from '@renderer/generic/field'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import DynamicTable from '@renderer/generic/dynamicTable'
import TextItem from '@renderer/generic/textItem'
import Money from '@renderer/generic/money'
import useGeneralInfo from '@renderer/hooks/generalInfo'
import resolveSalaryInfo from '@renderer/helpers/getSalaryInfo'

const ITEconomiqueForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const generalInfo = useGeneralInfo()

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: initialValues || {
      net: [],
      brut: []
    }
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const brutValues = useWatch({
    control,
    name: 'brut'
  })

  // Utiliser useWatch pour surveiller les FieldArrays
  const netValues = useWatch({
    control,
    name: 'net'
  })

  // Référence pour suivre les anciennes valeurs
  const previousValuesRef = useRef({})

  const submitForm = useCallback(
    (data) => {
      onSubmit(data) // Soumettre avec l'onSubmit passé en prop
    },
    [onSubmit]
  )

  useEffect(() => {
    const valuesChanged =
      JSON.stringify(formValues) !== JSON.stringify(previousValuesRef.current.formValues) ||
      JSON.stringify(brutValues) !== JSON.stringify(previousValuesRef.current?.brut) ||
      JSON.stringify(netValues) !== JSON.stringify(previousValuesRef.current?.net)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        brut: brutValues,
        net: netValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, brutValues, netValues, submitForm, handleSubmit])

  const getSalaryTotalAmount = useCallback((item = {}, days, type = 'net') => {
    const { amount = 0, percentage = 0 } = item

    const { amount: resolvedAmount, divisor } = resolveSalaryInfo(
      amount,
      generalInfo?.economique?.[type || 'brut']
    )

    return {
      value: (
        (parseInt(days) || 0) *
        ((parseFloat(resolvedAmount) || 0) / divisor) *
        ((parseFloat(percentage) || 0) / 100)
      ).toFixed(2),
      tooltip: (
        <math>
          <mn>{parseInt(days) || 0}</mn>
          <mo>x</mo>
          <mfrac>
            <mn>{parseFloat(resolvedAmount) || 0}</mn>
            <mn>{divisor}</mn>
          </mfrac>
          <mo>x</mo>
          <mfrac>
            <mn>{parseFloat(percentage) || 0}</mn>
            <mn>100</mn>
          </mfrac>
        </math>
      )
    }
  }, [])

  const copyDate = useCallback(
    (name, fieldName) => {
      const initial = typeof name === 'string' ? get(data, name) : name
      let filteredData = initial.map(({ start, end, percentage }) => ({
        start,
        end,
        percentage
      }))
      const currentData = cloneDeep(formValues?.[fieldName])
      if (currentData) {
        filteredData = currentData.concat(filteredData)
      }
      setValue(fieldName, filteredData)
    },
    [formValues]
  )

  const columns = (type) => [
    { header: '%', key: 'percentage', type: 'number', width: 50 },
    { header: 'common.start', key: 'start', type: 'start' },
    { header: 'common.end', key: 'end', type: 'end' },
    { header: 'common.days', key: 'days', type: 'calculated' },
    { header: `common.salary_yearly_${type}`, key: 'amount', type: 'salary', salaryType: type },
    { header: `common.total_${type}`, key: 'total', type: 'calculated' },
    {
      header: 'common.date_paiement',
      key: 'date_paiement',
      type: 'date',
      className: 'int'
    },
    {
      header: 'common.interest',
      key: 'interest',
      type: 'interest',
      median: true,
      className: 'int'
    }
  ]

  const customActions = (name) => ({
    label: 'common.import_date',
    actions: [
      {
        label: 'common.personnel',
        action: () => copyDate('incapacite_temp_personnel.periods', name)
      },
      {
        label: 'common.menagère',
        action: () => copyDate('incapacite_temp_menagere.periods', name)
      },
      {
        label: `common.economique.${name === 'net' ? 'brut' : 'net'}`,
        action: () => copyDate(name === 'net' ? formValues?.brut : formValues?.net, name)
      }
    ]
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicTable
        title="incapacite_temp.economique.title"
        subtitle="incapacite_temp.economique.indemnite_nette"
        columns={columns('net')}
        control={control}
        name="net"
        base="incapacite_temp_economique"
        formValues={formValues}
        editable={editable}
        calculateTotal={(item, days) => getSalaryTotalAmount(item, days, 'net')}
        customActions={customActions('net')}
        addRowDefaults={
          formValues?.net?.[0]
            ? { date_paiement: generalInfo?.config?.date_paiement }
            : {
                start: generalInfo?.date_accident,
                date_paiement: generalInfo?.config?.date_paiement
              }
        }
      />

      <DynamicTable
        subtitle="incapacite_temp.economique.indemnite_brute"
        columns={columns('brut')}
        control={control}
        name="brut"
        base="incapacite_temp_economique"
        formValues={formValues}
        editable={editable}
        calculateTotal={(item, days) => getSalaryTotalAmount(item, days, 'brut')}
        customActions={customActions('brut')}
        addRowDefaults={
          formValues?.brut?.[0]
            ? { date_paiement: generalInfo?.config?.date_paiement }
            : {
                start: generalInfo?.date_accident,
                date_paiement: generalInfo?.config?.date_paiement
              }
        }
      />
      <table style={{ maxWidth: 1200 }}>
        <tr>
          <TextItem path="incapacite_temp.economique.estimate" tag="td" />
          <td>
            <Field control={control} type="number" name={`estimate`} editable={editable}>
              {(props) => <input {...props} />}
            </Field>
            <div className="hide">
              <Money value={formValues?.estimate} />
            </div>
          </td>
          {editable && (
            <td>
              <button type="button" onClick={() => setValue('estimate', '')}>
                <TextItem path="common.delete" />
              </button>
            </td>
          )}
        </tr>
      </table>
    </form>
  )
}

export default ITEconomiqueForm
