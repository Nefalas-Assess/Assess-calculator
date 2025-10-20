import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import constants from '@renderer/constants'
import DynamicTable from '@renderer/generic/dynamicTable'
import Money from '@renderer/generic/money'
import useGeneralInfo from '@renderer/hooks/generalInfo'

const FraisCapForm = ({ initialValues, onSubmit, editable = true }) => {
  const generalInfo = useGeneralInfo()

  const { control, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      charges: [
        {
          date_paiement: generalInfo?.config?.date_paiement
        }
      ]
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
    { header: 'common.frais', key: 'name', type: 'text' },
    { header: 'common.date_paiement', key: 'date_paiement', type: 'date' },
    {
      header: 'common.ref_table',
      key: 'reference',
      type: 'reference',
      options: constants.reference_light.concat(constants.reference)
    },
    {
      header: 'common.taux_interet_capitalisation',
      key: 'rate',
      type: 'select',
      options: constants.interet_amount
    },
    { header: 'common.amount', key: 'amount', type: 'number' },
    {
      header: 'common.total',
      key: 'total',
      type: 'capitalization',
      props: {
        end: 'date_paiement',
        ref: 'reference',
        index: 'rate',
        amount: 'amount'
      }
    }
  ]

  const frais_payes_columns = [
    { header: 'common.frais', key: 'name', type: 'text' },
    { header: 'common.amount', key: 'amount', type: 'number' },
    {
      header: 'incapacite_perma.frais_cap.duration',
      key: 'year',
      type: 'select',
      options: constants.zeroToFifty
    },
    {
      header: 'common.ref_table',
      key: 'reference',
      type: 'reference'
    },
    {
      header: 'common.taux_interet_capitalisation',
      key: 'rate',
      type: 'select',
      options: constants.interet_amount
    },
    {
      header: 'common.total',
      key: 'total',
      type: 'capitalization',
      props: {
        duration: 'year',
        ref: 'reference',
        index: 'rate',
        amount: 'amount',
        noGender: true,
        base: 'data_va_eur_annees',
        displayStartIndex: 1
      }
    }
  ]

  const forfait_columns = [
    { header: 'common.frais', key: 'name', type: 'text' },
    {
      header: 'common.amount',
      key: 'amount',
      type: 'number',
      additionalContent: (e) => (
        <td className="hide">
          <Money value={e?.amount} />
        </td>
      )
    }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DynamicTable
        title="incapacite_perma.frais_cap.future"
        columns={frais_futurs_columns}
        control={control}
        name="charges"
        formValues={formValues}
        editable={editable}
        addRowDefaults={{
          date_paiement: generalInfo?.config?.date_paiement
        }}
      />
      <DynamicTable
        subtitle="incapacite_perma.frais_cap.paid"
        columns={frais_payes_columns}
        control={control}
        name="paid"
        formValues={formValues}
        editable={editable}
      />
      <DynamicTable
        subtitle="incapacite_perma.frais_cap.forfait"
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
