import React, { useState } from 'react'

const ITP = () => {
  // Fonction pour créer une nouvelle ligne avec des valeurs par défaut
  const createRow = () => ({
    heures: '', // Nombre d'heures
    total: '' // Total calculé automatiquement
  })

  // État contenant la liste des lignes dans le tableau
  const [rows, setRows] = useState([createRow()])

  // Fonction pour calculer le total pour une ligne donnée
  const calculateRow = (row) => {
    const { heures } = row
    let total = ''

    if (heures && !isNaN(heures)) {
      // Calcul du total basé sur le nombre d'heures
      total = (parseFloat(heures) * 11.5).toFixed(2)
    }

    return { total }
  }

  // Fonction pour ajouter une nouvelle ligne dans le tableau
  const addRow = () => {
    setRows([...rows, createRow()])
  }

  // Fonction pour supprimer une ligne dans le tableau
  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index)
    setRows(updatedRows)
  }

  // Fonction pour gérer les changements dans les champs d'entrée
  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value // Met à jour la valeur du champ modifié
    const { total } = calculateRow(updatedRows[index]) // Recalcule les champs dérivés
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

  return (
    <div id="content">
      <div id="top-menu">
        <button onClick={resetData}>Réinitialiser</button>
      </div>

      <div id="main">
        <h1>Aide de tiers (non-qualifiés)</h1>

        <table id="hospTable">
          <thead>
            <tr>
              <th>Nombre d'heures</th>
              <th>Total (€)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={row.heures}
                    onChange={(e) => handleInputChange(index, 'heures', e.target.value)}
                  />
                </td>
                <td>{row?.total}</td>
                <td>
                  <button onClick={addRow}>+</button>
                  <button onClick={() => removeRow(index)}>-</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="total-box">
          <strong>Total : </strong> {getTotalSum()} €
        </div>
      </div>
    </div>
  )
}

export default ITP