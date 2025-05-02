import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import { useForm, useWatch } from 'react-hook-form'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import DynamicTable from '@renderer/generic/dynamicTable'

const FraisFunForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

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

  const notAnticipatedValues = useWatch({
    control,
    name: 'not_anticipated_charges'
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
      JSON.stringify(notAnticipatedValues) !==
        JSON.stringify(previousValuesRef.current?.not_anticipated_charges)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        charges: chargesValues,
        not_anticipated_charges: notAnticipatedValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, chargesValues, submitForm, handleSubmit])

  const fraisColumns = [
    { header: 'Frais', key: 'name', type: 'text' },
    { header: 'Montant', key: 'amount', type: 'number' },
    {
      header: 'Montant anticipé',
      key: 'total',
      type: 'capitalization',
      props: {
        end: data?.general_info?.date_death,
        base: 'data_ff',
        refArray: constants.interet_amount,
        ref: 'ref',
        index: 'rate'
      }
    }
  ]

  const notAnticipatedColumns = [
    { header: 'Frais', key: 'name', type: 'text' },
    {
      header: 'Montant',
      key: 'amount',
      type: 'number',
      additionalContent: (e) => (
        <div className="money" style={{ display: 'none' }}>
          {e?.amount}
        </div>
      )
    }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Frais funéraires</h1>
      <h3>Variables</h3>
      <table id="IPVariables">
        <tr>
          <td>Tables de référence</td>
          <td>
            <Field control={control} type="reference" name={`ref`} editable={editable}></Field>
          </td>
        </tr>
        <tr>
          <td>Taux d'intérêt</td>
          <td>
            <Field
              control={control}
              type="select"
              options={constants.interet_amount}
              name={`rate`}
              editable={editable}
            ></Field>
          </td>
        </tr>
      </table>
      <DynamicTable
        subtitle="Frais anticipés"
        columns={fraisColumns}
        control={control}
        name="charges"
        formValues={formValues}
        editable={editable}
        calculateTotal={(e) => e?.amount}
      />
      <DynamicTable
        subtitle="Frais non-anticipés"
        columns={notAnticipatedColumns}
        control={control}
        name="not_anticipated_charges"
        formValues={formValues}
        editable={editable}
        calculateTotal={(e) => e?.amount}
      />
    </form>
  )
}

export default FraisFunForm
