import React, { useState } from 'react'

const ITM = () => {
  // Fonction pour créer une nouvelle ligne avec des valeurs par défaut
  const createRow = () => ({
    debut: '', // Date de début par défaut
    fin: '', // Date de fin par défaut
    jours: '', // Nombre de jours calculé automatiquement
    indemniteitp: 32, // Indemnité journalière par défaut
    indemniteitm: '',
    pourcentage: '', // Pourcentage d'application
    total: '' // Total calculé automatiquement
  })

  // Fonction appelée lorsqu'une touche est pressée dans un champ d'entrée
  // Si la touche "Tab" est pressée sur la dernière ligne, une nouvelle ligne est ajoutée
  const handleKeyDown = (index, e) => {
    if (e.key === 'Tab' && index === rows.length - 1) {
      e.preventDefault() // Empêche le comportement par défaut de "Tab"
      addRow() // Ajoute une nouvelle ligne
    }
  }

  // État contenant la liste des lignes dans le tableau
  // Initialement, il y a une seule ligne créée avec la fonction `createRow`
  const [rows, setRows] = useState([createRow()])

  // Fonction pour calculer le nombre de jours et le total pour une ligne donnée
  const calculateRow = (row) => {
    const { debut, fin, enfants, pourcentage, contribution } = row
    let jours = ''
    let indemniteitm = 30 // Valeur de base pour indemniteitm
    let total = ''

    // Calcul de l'indemnité journalière en fonction du nombre d'enfants
    indemniteitm += (enfants || 0) * 10

    if (debut && fin) {
      const debutDate = new Date(debut)
      const finDate = new Date(fin)
      if (!isNaN(debutDate) && !isNaN(finDate)) {
        // Calcul du nombre de jours entre les deux dates
        jours = Math.max(0, (finDate - debutDate) / (1000 * 60 * 60 * 24))
        // Calcul du total basé sur les jours, indemnité et pourcentage
        total = (
          jours *
          indemniteitm *
          (pourcentage / 100 || 0) *
          (contribution / 100 || 0)
        ).toFixed(2)
      }
    }

    return { jours, indemniteitm, total }
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

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index)
    setRows(updatedRows)
  }

  // Fonction pour gérer les changements dans les champs d'entrée
  // Met à jour les valeurs dans l'état `rows` et recalcul le total
  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value // Met à jour la valeur du champ modifié

    // Recalcule les champs dérivés
    const { jours, indemniteitm, total } = calculateRow(updatedRows[index])
    updatedRows[index].jours = jours
    updatedRows[index].indemniteitm = indemniteitm
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

      <div id="main"></div>
      <table id="itmTable">
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Enfant(s)</th>
            <th>Indemnité journalière (€)</th>
            <th>%</th>
            <th>Contribution (%)</th>
            <th>Total (€)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  type="date"
                  value={row.debut}
                  onChange={(e) => handleInputChange(index, 'debut', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="date"
                  value={row.fin}
                  onChange={(e) => handleInputChange(index, 'fin', e.target.value)}
                />
              </td>
              <td>
                <input type="number" value={row.jours} readOnly />
              </td>
              <td>
                <input
                  type="number"
                  value={row.enfants}
                  onChange={(e) =>
                    handleInputChange(index, 'enfants', parseInt(e.target.value) || 0)
                  }
                />
              </td>
              <td>
                <input type="number" value={row.indemniteitm} step="0.01" readOnly />
              </td>
              <td>
                <input
                  type="number"
                  value={row.pourcentage}
                  step="0.01"
                  onChange={(e) =>
                    handleInputChange(index, 'pourcentage', parseFloat(e.target.value))
                  }
                />
              </td>
              <td>
                <select
                  value={row.contribution}
                  onChange={(e) =>
                    handleInputChange(index, 'contribution', parseInt(e.target.value))
                  }
                >
                  <option value="0">0</option>
                  <option value="100">100</option>
                  <option value="65">65</option>
                  <option value="50">50</option>
                  <option value="35">35</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={row.total}
                  readOnly
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              </td>
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
  )
}

export default ITM
