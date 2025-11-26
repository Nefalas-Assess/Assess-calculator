import React, { useCallback, useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import DynamicTable from '@renderer/generic/dynamicTable'
import TextItem from '@renderer/generic/textItem'
import useGeneralInfo from '@renderer/hooks/generalInfo'

const FraisFunForm = ({ initialValues, onSubmit, editable = true }) => {
  const generalInfo = useGeneralInfo()

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
  }, [formValues, chargesValues, notAnticipatedValues, submitForm, handleSubmit])

  const fraisColumns = [
    { header: 'common.frais', key: 'name', type: 'text' },
    { header: 'common.montant', key: 'amount', type: 'number' },
    {
      header: 'deces.frais.montant_ant',
      key: 'total',
      type: 'capitalization',
      props: {
        end: generalInfo?.date_death,
        base: 'data_ff',
        refArray: constants.interet_amount,
        ref: 'ref',
        index: 'rate'
      }
    }
  ]

  const notAnticipatedColumns = [
    { header: 'common.frais', key: 'name', type: 'text' },
    {
      header: 'common.montant',
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
      <TextItem tag="h1" path="nav.deces.frais" />
      <TextItem tag="h3" path="common.variables" />
      <table id="IPVariables">
        <tr>
          <TextItem tag="td" path="common.ref_table" />
          <td>
            <Field control={control} type="reference" name={`ref`} editable={editable}></Field>
          </td>
        </tr>
        <tr>
          <td>
            <TextItem path="common.taux_interet" />
          </td>
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
        subtitle="deces.frais.frais_ant"
        columns={fraisColumns}
        control={control}
        name="charges"
        formValues={formValues}
        editable={editable}
        calculateTotal={(e) => e?.amount}
      />
      <DynamicTable
        subtitle="deces.frais.frais_non_ant"
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
