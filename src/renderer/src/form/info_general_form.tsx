import { isValid } from 'date-fns'
import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'

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
      children: [] // Liste vide d'enfants par défaut
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'children' // Champs dynamiques pour les enfants
  })

  const calculInterets = watch('calcul_interets') // Suivi de l'état de "calcul_interets"

  const addChild = () => {
    append({ firstName: '', lastName: '', birthDate: '' }) // Nouveau champ enfant
  }

  const submitForm = (data) => {
    onSubmit(data)
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
      <h3>Calcul des intérêts</h3>
      <div>
        <label>
          Voulez-vous calculer les intérêts ? 
          <select {...register('calcul_interets')}>
            <option value="oui">Oui</option>
            <option value="non">Non</option>
          </select>
        </label>
      </div>

      {/* Section visible uniquement si "Oui" est sélectionné */}
      {calculInterets === 'oui' && (
        <div className="int">
          <h4>Section pour le calcul des intérêts</h4>
          {/* Ajoutez ici le contenu spécifique à l'affichage des intérêts */}
        </div>
      )}

      <button type="submit">Enregistrer</button>
    </form>
  )
}

export default InfoForm
