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
    append({ name: '', birthDate: '' }) // Nouveau champ enfant
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
                style={{ width: 300 }}
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
                  style={{ width: 300 }}
                  type="text"
                  {...register(`children.${index}.name`, { required: 'Nom requis' })}
                />
                {errors.children?.[index]?.name && (
                  <span>{errors.children[index].name.message}</span>
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
          <table id="taux_it_Table">
            <tbody>
              <tr>
                <td>2025</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="4.5"
                    {...register('taux_int2025')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2024</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="5.75"
                    {...register('taux_int2024')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2023</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="5.25"
                    {...register('taux_int2023')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2022</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="1.5"
                    {...register('taux_int2022')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2021</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="1.75"
                    {...register('taux_int2021')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2020</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="1.75"
                    {...register('taux_int2020')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2019</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="2"
                    {...register('taux_int2019')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2018</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="2"
                    {...register('taux_int2018')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2017</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="2"
                    {...register('taux_int2017')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2016</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="2.25"
                    {...register('taux_int2016')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2015</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="2.5"
                    {...register('taux_int2015')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2014</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="2.75"
                    {...register('taux_int2014')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2013</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="2.75"
                    {...register('taux_int2013')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2012</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="4.25"
                    {...register('taux_int2012')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2011</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="3.75"
                    {...register('taux_int2011')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2010</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="3.25"
                    {...register('taux_int2010')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2009</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="5.5"
                    {...register('taux_int2009')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2008</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="7"
                    {...register('taux_int2008')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2007</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="6"
                    {...register('taux_int2007')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>2006 - 1996</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="7"
                    {...register('taux_int1996')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>1995 - 1986</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="8"
                    {...register('taux_int1986')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>1985</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="10"
                    {...register('taux_int1985')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>1984 - 1981</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="12"
                    {...register('taux_int1981')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>1980 - 1974</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="8"
                    {...register('taux_int1974')}
                  ></input>
                  %
                </td>
              </tr>
              <tr>
                <td>1973 - 1970</td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value="6.5"
                    {...register('taux_int1970')}
                  ></input>
                  %
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </form>
  )
}

export default InfoForm
