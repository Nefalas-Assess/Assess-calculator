import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'

const ITP = () => {
  const { data } = useContext(AppContext)

  // Fonction pour créer une nouvelle ligne avec des valeurs par défaut
  const createRow = () => ({
    number: '', // Valeur saisie par l'utilisateur
    coefficient: '', // Coefficient sélectionné
    total: '' // Total calculé automatiquement
  })

  // État contenant la liste des lignes
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
  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value

    // Calculer automatiquement le total si les champs nécessaires sont remplis
    const number = parseFloat(updatedRows[index].number) || 0
    const coefficient = parseFloat(updatedRows[index].coefficient) || 0
    updatedRows[index].total = (number * coefficient).toFixed(2)

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

        <h1>Frais</h1>
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
            {rows.map((row, index) => (
              <tr key={index}>
                <td>Administratif</td>
                <td></td>
                <td></td>
                <td><select
                    defaultValue=""
                    onChange={(e) => handleInputChange(index, 'paye', e.target.value)}>
                    <option value="" disabled>Sélectionnez                    </option>
                    <option>Oui</option>
                    <option>Non</option></select></td>
                <td><input type="number"value="100"/></td>
              </tr>
            ))}
          </tbody>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>Vestimantaires</td>
                <td></td>
                <td></td>
                <td><select
                    defaultValue=""
                    onChange={(e) => handleInputChange(index, 'paye', e.target.value)}>
                    <option value="" disabled>Sélectionnez</option>
                    <option>Oui</option>
                    <option>Non</option></select></td>
                <td><input type="number"value="400"/></td>
              </tr>
            ))}
          </tbody>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>Déplacement</td>
                <td><input
                    type="number"
                    defaultValue=""
                    onChange={(e) => handleInputChange(index, 'number', e.target.value)}/>KM
                </td>
                <td><select
                    defaultValue=""
                    onChange={(e) => handleInputChange(index, 'coefficient', e.target.value)}>
                    <option value="" disabled>Sélectionnez</option>
                    <option value="0.42">Véhicule automobile</option>
                    <option value="0.28">Autre</option></select>
                </td>
                <td><select
                    defaultValue=""
                    onChange={(e) => handleInputChange(index, 'paye', e.target.value)}>
                    <option value="" disabled>Sélectionnez</option>
                    <option>Oui</option>
                    <option>Non</option></select></td>
                <td>{row?.total}</td>
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