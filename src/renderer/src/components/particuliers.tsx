import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import data_pp from '@renderer/data/data_pp'
import { findClosestIndex } from '@renderer/helpers/general'
import PrejudiceParticuliersForm from '@renderer/form/prejudice_particulier_form'

const ITP = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ prejudice_particulier: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <PrejudiceParticuliersForm
          onSubmit={saveData}
          initialValues={data?.prejudice_particulier}
        />
      </div>
    </div>
  )

  // Fonction pour créer une nouvelle ligne avec des valeurs par défaut
  const createRow = () => ({
    debut: '', // Date de début par défaut
    fin: '', // Date de fin par défaut
    jours: '', // Nombre de jours calculé automatiquement
    pourcentage: '', // Pourcentage d'application
    total: '',
    coefficient: '' // Total calculé automatiquement
  })

  // État contenant la liste des lignes dans le tableau
  // Initialement, il y a une seule ligne créée avec la fonction `createRow`
  const [rows, setRows] = useState([createRow()])

  // Fonction pour calculer le nombre de jours et le total pour une ligne donnée
  const calculateRow = (row) => {
    const { debut, fin, indemnite, pourcentage } = row
    let jours = ''
    let total = ''

    if (debut && fin) {
      const debutDate = new Date(debut)
      const finDate = new Date(fin)
      if (!isNaN(debutDate) && !isNaN(finDate)) {
        // Calcul du nombre de jours entre les deux dates
        jours = Math.max(0, (finDate - debutDate) / (1000 * 60 * 60 * 24))
        // Calcul du total basé sur les jours, indemnité et pourcentage
        total = (jours * indemnite * (pourcentage / 100)).toFixed(2)
      }
    }
    return { jours, total }
  }

  // Fonction pour ajouter une nouvelle ligne dans le tableau
  const addRow = () => {
    const newRow = createRow()

    // Si une ligne existe déjà, on utilise la date de fin de la dernière ligne pour calculer la nouvelle date de début
    if (rows.length > 0) {
      const lastRowFin = rows[rows.length - 1].fin
      if (lastRowFin) {
        const finDate = new Date(lastRowFin)
        if (!isNaN(finDate)) {
          finDate.setDate(finDate.getDate() + 1) // Ajoute 1 jour à la date de fin précédente
          newRow.debut = finDate.toISOString().split('T')[0] // Formate la nouvelle date
        }
      }
    }

    // Ajoute la nouvelle ligne à l'état `rows`
    setRows([...rows, newRow])
  }

  // Fonction pour gérer les changements dans les champs d'entrée
  // Met à jour les valeurs dans l'état `rows` et recalcul le total
  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value // Met à jour la valeur du champ modifié
    const { jours, total } = calculateRow(updatedRows[index]) // Recalcule les champs dérivés
    updatedRows[index].jours = jours
    updatedRows[index].total = total
    setRows(updatedRows)
  }

  // Fonction pour calculer la somme totale de tous les totaux dans le tableau
  const getTotalSum = () => {
    return rows.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0).toFixed(2)
  }

  // Fonction pour réinitialiser les données (après confirmation de l'utilisateur)
  const resetData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser les données ?')) {
      setRows([createRow()]) // Réinitialise avec une seule ligne vide
    }
  }

  // Fonction pour imprimer uniquement la section "main"
  const printMain = () => {
    const mainContent = document.getElementById('main').innerHTML
    const originalContent = document.body.innerHTML

    // Remplace temporairement le contenu de la page par le contenu de <div id="main">
    document.body.innerHTML = mainContent

    // Lance l'impression
    window.print()

    // Restaure le contenu original de la page
    document.body.innerHTML = originalContent
    window.location.reload() // Recharge la page pour restaurer l'état React
  }

  const getTotalWithCoef = useCallback(
    (item) => {
      const coef = item?.coefficient && parseInt(item?.coefficient) - 1
      const age = data?.computed_info?.age_consolidation
      const keys = Object.keys(data_pp)
      const ageKey = findClosestIndex(keys, age)
      return Object.values(data_pp)[ageKey][coef]
    },
    [data]
  )

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index)
    setRows(updatedRows)
  }

  return (
    <div id="content">
      <div id="top-menu">
        <button onClick={resetData}>Réinitialiser</button>
        <button onClick={printMain}>Imprimer</button>
      </div>

      <div id="main">
        <h1>Quantum Doloris</h1>
        <table id="ipTable">
          <thead>
            <tr>
              <th>Âge consolidation</th>
              <th>Coefficient</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{data?.computed_info?.age_consolidation}</td>
                <td>
                  <select
                    defaultValue=""
                    onChange={(e) => handleInputChange(index, 'coefficient', e.target.value)}
                  >
                    <option value="" disabled>
                      Sélectionnez
                    </option>
                    <option>1/7</option>
                    <option>2/7</option>
                    <option>3/7</option>
                    <option>4/7</option>
                    <option>5/7</option>
                    <option>6/7</option>
                    <option>7/7</option>
                  </select>
                </td>
                <td>{getTotalWithCoef(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h1>Préjudice Esthétique</h1>
        <table id="ipTable">
          <thead>
            <tr>
              <th>Âge consolidation</th>
              <th>Coefficient</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{data?.computed_info?.age_consolidation}</td>
                <td>
                  <select
                    defaultValue=""
                    onChange={(e) => handleInputChange(index, 'coefficient', e.target.value)}
                  >
                    <option value="" disabled>
                      Sélectionnez
                    </option>
                    <option>1/7</option>
                    <option>2/7</option>
                    <option>3/7</option>
                    <option>4/7</option>
                    <option>5/7</option>
                    <option>6/7</option>
                    <option>7/7</option>
                  </select>
                </td>
                <td>{getTotalWithCoef(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* 
        <h1>Préjudice Sexuel</h1>
        <table id="ipTable">
          <thead>
            <tr>
              <th>Indemnité/Frais</th>
              <th>Numéro de facture</th>
              <th>Payé</th>
              <th>Total (€)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <select
                    defaultValue=""
                    onChange={(e) => handleInputChange(index, 'paye', e.target.value)}
                  >
                    <option value="" disabled>
                      Sélectionnez
                    </option>
                    <option>Oui</option>
                    <option>Non</option>
                  </select>
                </td>
                <td>
                  <input type="number" />
                </td>
                <td>
                  <button onClick={addRow}>+</button>
                  <button onClick={() => removeRow(index)}>-</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h1>Préjudice d'Agrément</h1>
        <table id="ipTable">
          <thead>
            <tr>
              <th>Indemnité/Frais</th>
              <th>Numéro de facture</th>
              <th>Payé</th>
              <th>Total (€)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <select
                    defaultValue=""
                    onChange={(e) => handleInputChange(index, 'paye', e.target.value)}
                  >
                    <option value="" disabled>
                      Sélectionnez
                    </option>
                    <option>Oui</option>
                    <option>Non</option>
                  </select>
                </td>
                <td>
                  <input type="number" />
                </td>
                <td>
                  <button onClick={addRow}>+</button>
                  <button onClick={() => removeRow(index)}>-</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table> */}

        {/* <div className="total-box">
          <strong>Total : </strong> {getTotalSum()} €
        </div> */}
      </div>
    </div>
  )
}

export default ITP
