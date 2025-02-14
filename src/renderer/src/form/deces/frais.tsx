import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import { findClosestIndex, getDays, getMedDate } from '@renderer/helpers/general'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import { intervalToDuration } from 'date-fns'
import data_f from '@renderer/data/data_ff_f'
import data_h from '@renderer/data/data_ff_h'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import Tooltip from '@renderer/generic/tooltip'
import { FaRegQuestionCircle } from 'react-icons/fa'

const Total = ({ values = {}, index, data }) => {
  // Calcul du montant total avec useMemo

  const amount = parseFloat(values?.charges?.[index]?.amount, 10)
  const { years: age = 0 } = intervalToDuration({
    start: data?.general_info?.date_naissance,
    end: data?.general_info?.date_death
  })

  const rate = constants?.interet_amount?.findIndex((e) => e?.value === parseFloat(values?.rate))
  const table = data?.general_info?.sexe === 'homme' ? data_h : data_f

  const coef = table?.[age]?.[rate]

  const totalAmount = useMemo(() => {
    return amount * coef
  }, [amount, coef])

  // Fonction pour rendre le tooltip
  const renderToolTipAmount = useCallback(() => {
    return (
      <>
        <div>
          <math>
            <mn>{amount}</mn>
            <mo>x</mo>
            <mn>{coef}</mn>
            <mo>=</mo>
            <mn>{totalAmount}</mn>
          </math>
        </div>
      </>
    )
  }, [totalAmount, values])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Money value={totalAmount} />
      <Tooltip tooltipContent={renderToolTipAmount()}>
        <FaRegQuestionCircle style={{ marginLeft: 5 }} />
      </Tooltip>
      <div className="hide">{totalAmount}</div>
    </div>
  )
}

const FraisFunForm = ({ initialValues, onSubmit, editable = true }) => {
  const { data } = useContext(AppContext)

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      ref: 'schryvers',
      charges: [{}]
    }
  })

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'charges' // Champs dynamiques pour les enfants
  })

  const formValues = watch()

  // Utiliser useWatch pour surveiller les FieldArrays
  const chargesValues = useWatch({
    control,
    name: 'charges'
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
      JSON.stringify(chargesValues) !== JSON.stringify(previousValuesRef.current?.charges)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        charges: chargesValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, chargesValues, submitForm, handleSubmit])

  const getTotalAnticipated = useCallback(
    (index) => {
      const amount = parseFloat(formValues?.charges?.[index]?.amount, 10)
      const { years: age = 0 } = intervalToDuration({
        start: data?.general_info?.date_naissance,
        end: data?.general_info?.date_death
      })

      const rate = constants?.interet_amount?.findIndex(
        (e) => e?.value === parseFloat(formValues?.rate)
      )
      const table = data?.general_info?.sexe === 'homme' ? data_h : data_f

      const coef = table?.[age]?.[rate]

      return amount * coef
    },
    [formValues, data]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Frais funéraires anticipés</h1>
      <h3>Variables</h3>
      <table id="IPVariables">
        <tr>
          <td>Tables de référence</td>
          <td>
            <Field
              control={control}
              type="select"
              options={constants.reference_funeraire}
              name={`ref`}
              editable={editable}
            ></Field>
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

      <h3>Frais</h3>
      <table id="itebTable" style={{ width: 1000 }}>
        <thead>
          <tr>
            <th>Frais</th>
            <th>Montant (€)</th>
            <th>Total anticipé</th>
            {editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {fields.map((child, index) => {
            return (
              <tr key={child.id}>
                <td>
                  <Field control={control} name={`charges.${index}.name`} editable={editable}>
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Field
                    control={control}
                    type="number"
                    name={`charges.${index}.amount`}
                    editable={editable}
                  >
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Total values={formValues} index={index} data={data} />
                </td>
                {editable && (
                  <td>
                    <button type="button" onClick={() => remove(index)}>
                      Supprimer
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {editable && (
        <button type="button" onClick={() => append({})}>
          Ajouter une ligne
        </button>
      )}
    </form>
  )
}

export default FraisFunForm
