import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import TotalBox from '@renderer/generic/totalBox'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import DynamicTable from '@renderer/generic/dynamicTable'

export const FraisForm = ({ onSubmit, initialValues, editable = true }) => {
  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      frais: [{}],
      administratif_value: '100',
      vestimentaire_value: '400',
      deplacement_value: 0,
      // By default véhicule automobile
      deplacement_type: 0.42
    }
  })

  const formValues = watch()

  // Fonction pour calculer le total des frais
  const totalSumFrais = useMemo(() => {
    return formValues?.frais
      ?.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)
      .toFixed(2)
  }, [formValues])

  const totalDeplacementFrais = useMemo(() => {
    return (formValues?.deplacement_value * formValues?.deplacement_type).toFixed(2)
  }, [formValues])

  const totalSumRest = useMemo(() => {
    return (
      parseFloat(totalDeplacementFrais || 0) +
      parseFloat(formValues?.administratif_value || 0) +
      parseFloat(formValues?.vestimentaire_value || 0) +
      parseFloat(formValues?.package_value || 0)
    ).toFixed(2)
  }, [formValues, totalDeplacementFrais])

  const totalAides = useMemo(() => {
    return (parseFloat(formValues?.aides || 0) * 11.5).toFixed(2)
  }, [formValues])

  const totalSumAll = useMemo(() => {
    return (
      parseFloat(totalSumFrais || 0) +
      parseFloat(totalSumRest || 0) +
      parseFloat(totalAides || 0)
    ).toFixed(2)
  }, [totalSumFrais, totalSumRest, totalAides])

  const fraisFields = useFieldArray({
    control,
    name: 'frais' // Champs dynamiques pour les enfants
  })

  const fraisValues = useWatch({
    control,
    name: 'frais'
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
      JSON.stringify(fraisValues) !== JSON.stringify(previousValuesRef.current?.frais)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        frais: fraisValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, fraisValues, submitForm, handleSubmit])

  const columns = [
    { header: 'Indemnité/Frais', key: 'indemnite', type: 'text' },
    { header: 'Numéro de facture', key: 'facture', type: 'text' },
    { header: 'Payé', key: 'paid', type: 'select', options: constants.boolean },
    {
      header: 'Montant (€)',
      key: 'amount',
      type: 'number',
      props: { step: '0.01' }
    },
    {
      header: 'Date frais',
      key: 'date_frais',
      type: 'start',
      className: 'int'
    },
    {
      header: 'Date du paiement',
      key: 'date_paiement',
      type: 'end',
      className: 'int'
    },
    { header: 'Intérêts', key: 'interest', type: 'interest', className: 'int' }
  ]

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <DynamicTable
        title="Frais (médicaux)"
        columns={columns}
        control={control}
        name="frais"
        formValues={formValues}
        editable={editable}
        addRowDefaults={{ coefficient: 5, amount: 30 }}
        calculateTotal={(e) => e.amount}
      />
      <div className="total-box">
        <strong>Total frais médicaux : </strong> <Money value={totalSumFrais} />
      </div>

      <table id="ipTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <th>Indemnité/Frais</th>
            <th></th>
            <th></th>
            <th>Payé</th>
            <th>Total (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Administratif [€ 50 - € 150]</td>
            <td></td>
            <td></td>
            <td>
              <Field
                control={control}
                type="select"
                options={constants.boolean}
                name={`administratif_paid`}
                editable={editable}
              ></Field>
            </td>
            <td>
              <Field
                control={control}
                type="number"
                name={`administratif_value`}
                editable={editable}
              >
                {(props) => <input {...props} />}
              </Field>
            </td>
          </tr>
          <tr>
            <td>Vestimentaires</td>
            <td></td>
            <td></td>
            <td>
              <Field
                control={control}
                type="select"
                options={constants.boolean}
                name={`vestimentaire_paid`}
                editable={editable}
              ></Field>
            </td>
            <td>
              <Field
                control={control}
                type="number"
                name={`vestimentaire_value`}
                editable={editable}
              >
                {(props) => <input {...props} />}
              </Field>
            </td>
          </tr>
          <tr>
            <td>Déplacement</td>
            <td>
              <Field control={control} type="number" name={`deplacement_value`} editable={editable}>
                {(props) => (
                  <>
                    <input {...props} /> KM
                  </>
                )}
              </Field>
            </td>
            <td>
              <Field
                control={control}
                type="select"
                options={constants.deplacement_type}
                name={`deplacement_type`}
                editable={editable}
              ></Field>
            </td>
            <td>
              <Field
                control={control}
                type="select"
                options={constants.boolean}
                name={`deplacement_paid`}
                editable={editable}
              ></Field>
            </td>
            <td>
              <Money value={totalDeplacementFrais} ignore />
            </td>
          </tr>
          <tr>
            <td>Forfait</td>
            <td></td>
            <td></td>
            <td>
              <Field
                control={control}
                type="select"
                options={constants.boolean}
                name={`package_paid`}
                editable={editable}
              ></Field>
            </td>
            <td>
              <Field control={control} type="number" name={`package_value`} editable={editable}>
                {(props) => (
                  <>
                    <input {...props} />
                  </>
                )}
              </Field>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="total-box">
        <strong>Total : </strong> <Money value={totalSumRest} />
      </div>

      <h1>Aide de tiers (non-qualifiés)</h1>
      <table id="hospTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <th>Nombre d'heures</th>
            <th>Total (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Field control={control} type="number" name={`aides`} editable={editable}>
                {(props) => <input min={0} {...props} />}
              </Field>
            </td>
            <td>
              <Money value={totalAides} />
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  )
}

export default FraisForm
