import React, { useState } from 'react'

const EFFA = () => {
  // Fonction pour créer une nouvelle ligne avec des valeurs par défaut
  const createRow = () => ({
    debut: '', // Date de début par défaut
    fin: '', // Date de fin par défaut
    jours: '', // Nombre de jours calculé automatiquement
    indemnite: 30, // Indemnité journalière par défaut
    pourcentage: '', // Pourcentage d'application
    coefficient: '',
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
    console.log(row)
    const { debut, fin, indemnite, pourcentage, coefficient } = row
    let jours = ''
    let total = ''

    if (debut && fin) {
      const debutDate = new Date(debut)
      const finDate = new Date(fin)
      if (!isNaN(debutDate) && !isNaN(finDate)) {
        // Calcul du nombre de jours entre les deux dates
        jours = Math.max(0, (finDate - debutDate) / (1000 * 60 * 60 * 24) + 1)
        // Calcul du total basé sur les jours, indemnité et pourcentage
        total = (jours * coefficient).toFixed(2)
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

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index)
    setRows(updatedRows)
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

  return (
    <div id="content">
      <div id="main">
        <h1>Pretium Doloris Temporaire</h1>

        <table id="effaTable">
          <thead>
            <tr>
              <th>Début</th>
              <th>Fin</th>
              <th>Jours</th>
              <th>Coefficient</th>
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
                <td>{row?.jours}</td>
                <td>
                <select
                    defaultValue=""
                    onChange={(e) => handleInputChange(index, 'coefficient', e.target.value)}
                >
                    <option value="" disabled>
                    Sélectionnez
                    </option>
                    <option value="1.15">1/7</option>
                    <option value="3.50">2/7</option>
                    <option value="7">3/7</option>
                    <option value="11.50">4/7</option>
                    <option value="17">5/7</option>
                    <option value="24">6/7</option>
                    <option value="32">7/7</option>
                </select>
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

export default EFFA