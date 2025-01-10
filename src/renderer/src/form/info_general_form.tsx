import React, { useState } from 'react'

const InfoForm = ({ onSubmit, initialValues }) => {
  const [formData, setFormData] = useState(
    initialValues || {
      creation_maj_date: '',
      reference_dossier: '',
      nom_victime: '',
      date_accident: '',
      date_naissance: '',
      date_consolidation: '',
      statut: 'marié', // Default value
      profession: 'employe' // Default value
    }
  )

  const handleChange = (e) => {
    const { name, value, type } = e.target

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'date' ? new Date(value) : value // Convert 'date' input to JS Date
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    // Replace with your desired logic (e.g., API call)
  }

  return (
    <form onSubmit={handleSubmit}>
      <table id="infogTable">
        <tbody>
          <tr>
            <td>Date de création/màj</td>
            <td>
              <input
                type="date"
                name="creation_maj_date"
                value={
                  formData.creation_maj_date
                    ? formData.creation_maj_date.toISOString().split('T')[0]
                    : ''
                }
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <td>Référence du dossier</td>
            <td>
              <input
                type="text"
                name="reference_dossier"
                size="30"
                value={formData.reference_dossier}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <td>Nom de la victime</td>
            <td>
              <input
                type="text"
                name="nom_victime"
                size="30"
                value={formData.nom_victime}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <td>Date de l'accident</td>
            <td>
              <input
                type="date"
                name="date_accident"
                value={
                  formData.date_accident
                    ? new Date(formData.date_accident).toISOString().split('T')[0]
                    : ''
                }
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <td>Date de naissance</td>
            <td>
              <input
                type="date"
                name="date_naissance"
                value={
                  formData.date_naissance
                    ? new Date(formData.date_naissance).toISOString().split('T')[0]
                    : ''
                }
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <td>Date de consolidation</td>
            <td>
              <input
                type="date"
                name="date_consolidation"
                value={
                  formData.date_consolidation
                    ? new Date(formData.date_consolidation).toISOString().split('T')[0]
                    : ''
                }
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <td>Statut</td>
            <td>
              <select name="statut" value={formData.statut} onChange={handleChange}>
                <option value="marié">Marié</option>
                <option value="célibataire">Célibataire</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Profession</td>
            <td>
              <select name="profession" value={formData.profession} onChange={handleChange}>
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
      <button type="submit">Save</button>
    </form>
  )
}

export default InfoForm
