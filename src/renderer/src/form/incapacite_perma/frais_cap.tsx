import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import constants from '@renderer/constants'
import DynamicTable from '@renderer/generic/dynamicTable'

const FraisCapForm = ({ initialValues, onSubmit, editable = true }) => {
  const { control, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      charges: [{}]
    }
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const chargesValues = useWatch({
    control,
    name: 'charges'
  })

  // Utiliser useWatch pour surveiller les FieldArrays
  const paidValues = useWatch({
    control,
    name: 'paid'
  })

  const packageValues = useWatch({
    control,
    name: 'package'
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
      JSON.stringify(chargesValues) !== JSON.stringify(previousValuesRef.current?.charges) ||
      JSON.stringify(paidValues) !== JSON.stringify(previousValuesRef.current?.paid) ||
      JSON.stringify(packageValues) !== JSON.stringify(previousValuesRef.current?.package)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        charges: chargesValues,
        paid: paidValues,
        package: packageValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, chargesValues, paidValues, packageValues, submitForm, handleSubmit])

  const frais_futurs_columns = [
    { header: 'Frais', key: 'name', type: 'text' },
    { header: 'Date du paiement', key: 'date_payment', type: 'date' },
    {
      header: 'Table de référence',
      key: 'reference',
      type: 'reference',
      options: constants.reference_light.concat(constants.reference)
    },
    {
      header: "Taux d'intérêt de la capitalisation",
      key: 'rate',
      type: 'select',
      options: constants.interet_amount
    },
    { header: 'Montant', key: 'amount', type: 'number' },
    {
      header: 'Total',
      key: 'total',
      type: 'capitalization',
      props: { end: 'date_payment', ref: 'reference', index: 'rate', amount: 'amount' }
    }
  ]

  const frais_payes_columns = [
    { header: 'Frais', key: 'name', type: 'text' },
    { header: 'Montant', key: 'amount', type: 'number' },
    { header: "Nombre d'années", key: 'year', type: 'select', options: constants.zeroToFifty },
    {
      header: 'Table de référence',
      key: 'reference',
      type: 'reference'
    },
    {
      header: "Taux d'intérêt de la capitalisation",
      key: 'rate',
      type: 'select',
      options: constants.interet_amount
    },
    {
      header: 'Total',
      key: 'total',
      type: 'capitalization',
      props: {
        duration: 'year',
        ref: 'reference',
        index: 'rate',
        amount: 'amount',
        noGender: true,
        base: 'data_va_eur_annees'
      }
    }
  ]

  const forfait_columns = [
    { header: 'Frais', key: 'name', type: 'text' },
    { header: 'Montant', key: 'amount', type: 'number' }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicTable
        title="Frais futurs"
        columns={frais_futurs_columns}
        control={control}
        name="charges"
        formValues={formValues}
        editable={editable}
        addRowDefaults={{ amount: 30 }}
      />
      <DynamicTable
        subtitle="Frais payés dans N années"
        columns={frais_payes_columns}
        control={control}
        name="paid"
        formValues={formValues}
        editable={editable}
      />
      <DynamicTable
        subtitle="Forfait"
        columns={forfait_columns}
        control={control}
        name="package"
        formValues={formValues}
        editable={editable}
      />
    </form>
  )
}

export default FraisCapForm
