import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import DynamicTable from '@renderer/generic/dynamicTable'
import useGeneralInfo from '@renderer/hooks/generalInfo'
import getIndicativeAmount from '@renderer/helpers/getIndicativeAmount'

const ITPersonnelForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const generalInfo = useGeneralInfo()

  const indicativeAmount = getIndicativeAmount(generalInfo?.config?.incapacite_perso, 32)

  const { control, setValue, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      periods: []
    }
  })

  const formValues = watch()

  const previousValuesRef = useRef({})

  const periodsValues = useWatch({
    control,
    name: 'periods'
  })

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

  const getTotalAmount = useCallback((item, days) => {
    const { amount = 0, percentage = 0 } = item

    return {
      value: (
        (parseInt(days) || 0) *
        (parseFloat(amount) || 0) *
        ((parseFloat(percentage) || 0) / 100)
      ).toFixed(2),
      tooltip: (
        <div>
          <math>
            <mn>{parseInt(days) || 0}</mn>
            <mo>x</mo>
            <mn>{parseFloat(amount) || 0}</mn>
            <mo>x</mo>
            <mfrac>
              <mn>{parseFloat(percentage) || 0}</mn>
              <mn>100</mn>
            </mfrac>
          </math>
        </div>
      )
    }
  }, [])

  const copyDate = useCallback(
    (name) => {
      const initial = get(data, name)
      let filteredData = initial.map(({ start, end, percentage }) => ({
        start,
        end,
        percentage,
        amount: indicativeAmount
      }))
      const currentData = cloneDeep(formValues?.periods)
      if (formValues?.periods) {
        filteredData = currentData.concat(filteredData)
      }
      setValue('periods', filteredData)
    },
    [formValues, indicativeAmount, data, setValue]
  )

  const customActions = {
    label: 'common.import_date',
    actions: [
      {
        label: 'common.menagère',
        action: () => copyDate('incapacite_temp_menagere.periods')
      },
      {
        label: 'common.economique.net',
        action: () => copyDate('incapacite_temp_economique.net')
      },
      {
        label: 'common.economique.brut',
        action: () => copyDate('incapacite_temp_economique.brut')
      }
    ]
  }

  const columns = [
    { header: '%', key: 'percentage', type: 'number', width: 50 },
    {
      header: 'common.start',
      minDate: generalInfo?.date_accident,
      key: 'start',
      type: 'start'
    },
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
        title="incapacite_temp.personnel.title"
        base="incapacite_temp_personnel"
        columns={columns}
        control={control}
        name="periods"
        formValues={formValues}
        editable={editable}
        addRowDefaults={addRowDefaults}
        calculateTotal={getTotalAmount}
        customActions={customActions}
      />
    </form>
  )
}

export default ITPersonnelForm
