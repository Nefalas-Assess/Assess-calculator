import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'

export const FraisForm = ({ onSubmit, initialValues }) => {
  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      frais: [{}],
      administratif_value: '100',
      vestimentaire_value: '400'
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
      parseFloat(formValues?.vestimentaire_value || 0)
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
      <table style={{ width: 1000 }}>
        <thead>
          <tr>
            <th>Indemintés/Frais</th>
            <th>Numéro de facture </th>
            <th>Payé</th>
            <th>Montant</th>
            <th className="int">Date frais</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts (€)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {fraisFields?.fields.map((child, index) => (
            <tr key={child.id}>
              <td>
                <input type="text" {...register(`frais.${index}.indemnite`)} />
              </td>
              <td>
                <input type="text" {...register(`frais.${index}.facture`)} />
              </td>
              <td>
                <select {...register(`frais.${index}.paid`)}>
                  <option value={true}>Oui</option>
                  <option value={false}>Non</option>
                </select>
              </td>
              <td>
                <input type="number" {...register(`frais.${index}.amount`)} />
              </td>
              <td className="int">
                <input type="date" {...register(`frais.${index}.date_frais`)} />
              </td>
              <td className="int">
                <input type="date" {...register(`frais.${index}.date_paiement`)} />
              </td>
              <td className="int">
                <Interest
                  amount={formValues?.frais[index]?.amount}
                  start={formValues?.frais[index]?.date_frais}
                  end={formValues?.frais[index]?.date_paiement}
                />
              </td>
              <td>
                <button onClick={() => fraisFields?.remove(index)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => fraisFields?.append({})}>Ajouter frais</button>
      <div className="total-box">
        <strong>Total frais médicaux : </strong> <Money value={totalSumFrais} />
      </div>

      <table id="ipTable">
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
              <select {...register('administratif_paid')}>
                <option>Oui</option>
                <option>Non</option>
              </select>
            </td>
            <td>
              <input type="number" {...register('administratif_value')} />
            </td>
          </tr>
          <tr>
            <td>Vestimentaires</td>
            <td></td>
            <td></td>
            <td>
              <select {...register('vestimentaire_paid')}>
                <option>Oui</option>
                <option>Non</option>
              </select>
            </td>
            <td>
              <input type="number" {...register('vestimentaire_value')} />
            </td>
          </tr>
          <tr>
            <td>Déplacement</td>
            <td>
              <input type="number" {...register('deplacement_value')} />
              KM
            </td>
            <td>
              <select {...register('deplacement_type')}>
                <option value="" disabled>
                  Sélectionnez
                </option>
                <option value="0.42">Véhicule automobile</option>
                <option value="0.28">Autre</option>
              </select>
            </td>
            <td>
              <select {...register('deplacement_paid')}>
                <option>Oui</option>
                <option>Non</option>
              </select>
            </td>
            <td>
              <Money value={totalDeplacementFrais} />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="total-box">
        <strong>Total : </strong> <Money value={totalSumRest} />
      </div>

      <h1>Aide de tiers (non-qualifiés)</h1>
      <table id="hospTable">
        <thead>
          <tr>
            <th>Nombre d'heures</th>
            <th>Total (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input type="number" min={0} {...register(`aides`)} />
            </td>
            <td>
              <Money value={totalAides} />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="total-box">
        <strong>Total des heures : </strong> <Money value={totalAides} />
      </div>
      <div className="total-box">
        <strong>Total général : </strong> <Money value={totalSumAll} />
      </div>
    </form>
  )
}

export default FraisForm
