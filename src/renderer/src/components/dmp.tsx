import Money from '@renderer/generic/money'
import React, { useState } from 'react'

const DMP = () => {
  // Constante X, modifiable selon vos besoins
  const X = 1

  // État pour les lignes des tableaux
  const [rows, setRows] = useState([{ revenu: 0, membres: 0, total: 0 }])

  // Gestion des modifications des champs d'entrée
  const handleInputChange = (rows, setRows, index, field, value) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value

    // Recalcul du total pour cette ligne
    if (field === 'revenu' || field === 'membres') {
      updatedRows[index].total = calculateTotal(
        updatedRows[index].revenu,
        updatedRows[index].membres,
        X
      )
    }

    setRows(updatedRows)
  }

  // Calcul du total pour une ligne donnée
  const calculateTotal = (revenu, membres, X) => {
    return revenu * (membres + 1) * X
  }

  // Calcul du total global
  const getTotalSum = () => {
    return rows.reduce((sum, row) => sum + row.total, 0).toFixed(2)
  }

  // Ajouter une nouvelle ligne
  const addRow = () => {
    setRows([...rows, { revenu: 0, membres: 0, total: 0 }])
  }

  // Supprimer une ligne
  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index)
    setRows(updatedRows)
  }

  return (
    <div id="content">
      <div id="main">
        <h1>Préjudices des proches</h1>
        <h3>Dommage moral des proches</h3>

        <table>
          <thead>
            <tr>
              <th>Nom du membre de la famille</th>
              <th>Lien de parenté</th>
              <th>Indemnité (€)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <>
                <tr key={index}>
                  <td>
                    <input style={{ width: 300 }} type="text"></input>
                  </td>
                  <td>
                    <select>
                      <option></option>
                      <option>Partenaire [€ 15.000 - € 45.000]</option>
                      <option>Parent/Enfant [€ 15.000 - € 45.000]</option>
                      <option>Frère/Soeur [€ 7.500 - € 25.000]</option>
                      <option>Grand-parent/Petit-enfant [€ 7.500 - € 25.000]</option>
                      <option>Fausse couche [€ 3.000 - € 9.000]</option>
                    </select>
                  </td>
                  <td>
                    <input type="number"></input>
                  </td>
                  <td>
                    <button onClick={addRow}>+</button>
                    <button onClick={() => removeRow(index)}>-</button>
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </table>

        <h3>Perte du revenu du défunt</h3>

        <table id="itebTable">
          <thead>
            <tr>
              <th>Revenu total du ménage (€)</th>
              <th>Nombre de membres du ménage avant le décès</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="number"
                    value={row.revenu}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChange(rows, setRows, index, 'revenu', parseFloat(e.target.value))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.membres}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChange(rows, setRows, index, 'membres', parseFloat(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Money value={row.total.toFixed(2)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="total-box">
          <strong>Total : </strong> <Money value={getTotalSum()}/>
        </div>
      </div>
    </div>
  )
}

export default DMP
