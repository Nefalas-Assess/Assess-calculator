import { isValid } from 'date-fns'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'

export const InfoForm = ({ onSubmit, initialValues }) => {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: initialValues || {
      nom_victime: '',
      sexe: '',
      date_accident: '',
      date_naissance: '',
      date_consolidation: '',
      statut: 'marié', // Valeur par défaut
      profession: 'employe', // Valeur par défaut
      calcul_interets: 'non',
      children: [] // Liste vide d'enfants par défaut
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'children' // Champs dynamiques pour les enfants
  })

  const formValues = watch() // Suivi de l'état de "calcul_interets"

  // Utiliser useWatch pour surveiller les FieldArrays
  const childrenValues = useWatch({
    control,
    name: 'children'
  })

  const submitForm = useCallback(
    (data) => {
      onSubmit(data) // Soumettre avec l'onSubmit passé en prop
    },
    [onSubmit]
  )

  const previousValuesRef = useRef({})

  useEffect(() => {
    const valuesChanged =
      JSON.stringify(formValues) !== JSON.stringify(previousValuesRef.current.formValues) ||
      JSON.stringify(childrenValues) !== JSON.stringify(previousValuesRef.current?.children)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        children: childrenValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, childrenValues, submitForm, handleSubmit])

  const addChild = () => {
    append({ firstName: '', lastName: '', birthDate: '' }) // Nouveau champ enfant
  }

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <h3>General</h3>
      <table id="infogTable">
        <tbody>
          <tr>
            <td>Nom de la victime</td>
            <td>
              <input
                type="text"
                {...register('nom_victime', { required: 'Ce champ est requis' })}
              />
              {errors.nom_victime && <span>{errors.nom_victime.message}</span>}
            </td>
          </tr>
          <tr>
            <td>Sexe</td>
            <td>
              <select {...register('sexe')}>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Date de l'accident</td>
            <td>
              <input type="date" {...register('date_accident')} />
            </td>
          </tr>
          <tr>
            <td>Date de naissance</td>
            <td>
              <input type="date" {...register('date_naissance')} />
            </td>
          </tr>
          <tr>
            <td>Date de consolidation</td>
            <td>
              <input type="date" {...register('date_consolidation')} />
            </td>
          </tr>
          <tr>
            <td>Situation conjugale</td>
            <td>
              <select {...register('statut')}>
                <option value="marié">Marié</option>
                <option value="célibataire">Célibataire</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Statut professionnel</td>
            <td>
              <select {...register('profession')}>
                <option value="employe">Employé</option>
                <option value="ouvrier">Ouvrier</option>
                <option value="sans_emploi">Sans emploi</option>
                <option value="retraite">Retraité</option>
                <option value="independant">Indépendant</option>
                <option value="fonctionnaire">Fonctionnaire</option>
                <option value="invalide">Invalide</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Enfants</h3>
      <table>
        <thead>
          <tr>
            <th>Prénom</th>
            <th>Nom</th>
            <th>Date de naissance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((child, index) => (
            <tr key={child.id}>
              <td>
                <input
                  type="text"
                  {...register(`children.${index}.firstName`, { required: 'Prénom requis' })}
                />
                {errors.children?.[index]?.firstName && (
                  <span>{errors.children[index].firstName.message}</span>
                )}
              </td>
              <td>
                <input
                  type="text"
                  {...register(`children.${index}.lastName`, { required: 'Nom requis' })}
                />
                {errors.children?.[index]?.lastName && (
                  <span>{errors.children[index].lastName.message}</span>
                )}
              </td>
              <td>
                <input
                  type="date"
                  {...register(`children.${index}.birthDate`, { required: 'Date requise' })}
                />
                {errors.children?.[index]?.birthDate && (
                  <span>{errors.children[index].birthDate.message}</span>
                )}
              </td>
              <td>
                <button type="button" onClick={() => remove(index)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={addChild}>
        Ajouter un enfant
      </button>

      {/* Sélecteur pour les intérêts */}
      <div>
        <label>
          <h3>Voulez-vous calculer les intérêts ? </h3>
          <select {...register('calcul_interets')}>
            <option value={false}>Non</option>
            <option value={true}>Oui</option>
          </select>
        </label>
      </div>

      {/* Section visible uniquement si "Oui" est sélectionné */}
      {formValues?.calcul_interets && (
        <div className="int">
          <input type="number" {...register('taux_int')}></input>
          <label>%</label>
        </div>
      )}
    </form>
  )
}

export default InfoForm
