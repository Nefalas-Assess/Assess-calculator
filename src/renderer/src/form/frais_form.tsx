import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import TotalBox from '@renderer/generic/totalBox'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'

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

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <h1>Frais (médicaux)</h1>
      <table style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <th>Indemnité/Frais</th>
            <th>Numéro de facture </th>
            <th>Payé</th>
            <th>Montant (€)</th>
            <th className="int">Date frais</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts (€)</th>
            {editable && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {fraisFields?.fields.map((child, index) => (
            <tr key={child.id}>
              <td>
                <Field control={control} name={`frais.${index}.indemnite`} editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td>
                <Field control={control} name={`frais.${index}.facture`} editable={editable}>
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td>
                <Field
                  control={control}
                  type="select"
                  options={constants.boolean}
                  name={`frais.${index}.paid`}
                  editable={editable}
                ></Field>
              </td>
              <td>
                <Field
                  control={control}
                  type="number"
                  name={`frais.${index}.amount`}
                  editable={editable}
                >
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td className="int">
                <Field
                  control={control}
                  type="date"
                  name={`frais.${index}.date_frais`}
                  editable={editable}
                >
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td className="int">
                <Field
                  control={control}
                  type="date"
                  name={`frais.${index}.date_paiement`}
                  editable={editable}
                >
                  {(props) => <input {...props} />}
                </Field>
              </td>
              <td className="int">
                <Interest
                  amount={formValues?.frais[index]?.amount}
                  start={formValues?.frais[index]?.date_frais}
                  end={formValues?.frais[index]?.date_paiement}
                />
              </td>
              {editable && (
                <td>
                  <button onClick={() => fraisFields?.remove(index)}>Supprimer</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {editable && <button onClick={() => fraisFields?.append({})}>Ajouter frais</button>}
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
