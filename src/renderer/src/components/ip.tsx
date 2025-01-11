import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'

const ITP = () => {
  const { data } = useContext(AppContext)

  // Fonction pour créer une nouvelle ligne avec des valeurs par défaut
  const createRow = () => ({
    debut: '', // Date de début par défaut
    fin: '', // Date de fin par défaut
    jours: '', // Nombre de jours calculé automatiquement
    indemniteitp: 32, // Indemnité journalière par défaut
    indemniteitm: 30,
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

  const contributionOptions = [0, 100, 65, 50, 35]

  const getPoint = useCallback((age) => {
    if (age <= 15) return 3660
    else if (age >= 85) return 495
    else if (age === 16) return 3600
    else if (age === 17) return 3555
    else {
      const mult = age - 17
      return 3555 - mult * 45
    }
  }, [])

  console.log(getPoint(data?.computed_info?.age_consolidation))

  return (
    <div id="content">
      <div id="main">
        <h1>Incapacités personnelles permanentes</h1>

        <table id="ipTable">
          <thead>
            <tr>
              <th>Âge consolidation</th>
              <th>Points</th>
              <th>%</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{data?.computed_info?.age_consolidation}</td>
                <td>{getPoint(data?.computed_info?.age_consolidation)}</td>
                <td>
                  <input
                    type="number"
                    value={row.pourcentageipp}
                    onChange={(e) => handleInputChange(index, 'pourcentageipp', e.target.value)}
                  />
                </td>
                <td>{(row.pointsipp * row.pourcentageipp).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h1>Incapacités ménagères permanentes</h1>

        <table id="ipTable">
          <thead>
            <tr>
              <th>Âge consolidation</th>
              <th>Points</th>
              <th>%</th>
              <th>Contribution (%)</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{data?.computed_info?.age_consolidation}</td>
                <td>{getPoint(data?.computed_info?.age_consolidation)}</td>
                <td>
                  <input
                    type="number"
                    value={row.pourcentageimp}
                    onChange={(e) => handleInputChange(index, 'pourcentageimp', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={row.contribution || contributionOptions[0]}
                    onChange={(e) => handleInputChange(index, 'contribution', e.target.value)}
                  >
                    {contributionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}%
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {(row.pointsimp * row.pourcentageimp * (row.contribution / 100)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h1>Incapacités économiques permanentes</h1>

        <table id="ipTable">
          <thead>
            <tr>
              <th>Âge consolidation</th>
              <th>Points</th>
              <th>%</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{data?.computed_info?.age_consolidation}</td>
                <td>{getPoint(data?.computed_info?.age_consolidation)}</td>
                <td>
                  <input
                    type="number"
                    value={row.pourcentageiep}
                    onChange={(e) => handleInputChange(index, 'pourcentageiep', e.target.value)}
                  />
                </td>
                <td>{(row.pointsiep * row.pourcentageiep).toFixed(2)}</td>
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
