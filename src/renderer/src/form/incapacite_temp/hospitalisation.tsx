import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import DynamicTable from '@renderer/generic/dynamicTable'
import useGeneralInfo from '@renderer/hooks/generalInfo'
import getIndicativeAmount from '@renderer/helpers/getIndicativeAmount'

const HospitalisationForm = ({ initialValues, onSubmit, editable = true }) => {
  const generalInfo = useGeneralInfo()
  const { control, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      periods: []
    }
  })

  const indicativeAmount = getIndicativeAmount(generalInfo?.config?.hospitalisation, 7)

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const periodsValues = useWatch({
    control,
    name: 'periods'
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
      JSON.stringify(periodsValues) !== JSON.stringify(previousValuesRef.current?.periods)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        periods: periodsValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, periodsValues, submitForm, handleSubmit])

  const getTotalAmount = useCallback((values, days) => {
    return {
      value: (parseInt(days || 0) * parseFloat(values?.amount || 0)).toFixed(2),
      tooltip: (
        <math>
          <mn>{parseInt(days || 0)}</mn>
          <mo>x</mo>
          <mn>{parseFloat(values?.amount || 0)}</mn>
        </math>
      )
    }
  }, [])

  const columns = [
    { header: 'common.start', key: 'start', type: 'start' },
    { header: 'common.end', key: 'end', type: 'end' },
    { header: 'common.days', key: 'days', type: 'calculated' },
    {
      header: 'common.indemnite_journaliere',
      key: 'amount',
      type: 'number',
      props: { step: '1' },
      width: 50
    },
    { header: 'common.total', key: 'total', type: 'calculated' },
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

  const addRowDefaults = useMemo(() => {
    const defaultRow = {
      amount: indicativeAmount,
      date_paiement: generalInfo?.config?.date_paiement
    }

    if (!formValues?.periods?.[0]) {
      defaultRow.start = generalInfo?.date_accident
    }

    return defaultRow
  }, [formValues, generalInfo, indicativeAmount])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicTable
        title="incapacite_temp.hospitalisation.title"
        columns={columns}
        control={control}
        name="periods"
        base="hospitalisation"
        formValues={formValues}
        editable={editable}
        addRowDefaults={addRowDefaults}
        calculateTotal={getTotalAmount}
      />
    </form>
  )
}

export default HospitalisationForm
