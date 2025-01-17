import Money from '@renderer/generic/money'
import React, { useState } from 'react'

const ITP = () => {
  const createRow = () => ({
    coefficient: '',
    frais: '',
    total: ''
  })

  const [brutRows, setBrutRows] = useState([createRow()])

  const calculateRow = (row) => {
    const { coefficient, frais } = row
    let total = ''

    if (coefficient && frais) {
      total = ((1 - coefficient) * frais).toFixed(2)
    }

    return { total }
  }

  const handleInputChange = (rows, setRows, index, field, value) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value

    const { total } = calculateRow(updatedRows[index])
    updatedRows[index].total = total

    setRows(updatedRows)
  }

  const addRow = (rows, setRows) => {
    setRows([...rows, createRow()])
  }

  const removeRow = (rows, setRows, index) => {
    const updatedRows = rows.filter((_, i) => i !== index)
    setRows(updatedRows)
  }

  const getTotalSum = (rows, field) =>
    rows.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0).toFixed(2)

  return (
    <div id="content">
      <div id="main">
        <h1>Frais funéraires anticipés</h1>
        <h3>Variables</h3>
        <table id="IPVariables">
          <tr>
            <td>Tables de référence</td>
            <td>
              <select onChange={(e) => handleInputChange(index, 'table', e.target.value)}>
                <option>Schryvers 2024 | Paiement anticipé frais funéraires</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Taux d'intérêt</td>
            <td>
              <select
                defaultValue=""
                onChange={(e) => handleInputChange(index, 'int', e.target.value)}
              >
                <option value="" disabled>
                  Sélectionnez
                </option>
                <option>0.5</option>
                <option>0.8</option>
                <option>1</option>
                <option>1.5</option>
                <option>2</option>
                <option>2.5</option>
                <option>3</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Date du décès</td>
            <td>
              <input type="date" />
            </td>
          </tr>
        </table>

        <h3>Frais</h3>

        {/* Tableau Salaire annuel brut */}
        <table id="itebTable">
          <thead>
            <tr>
              <th>Frais</th>
              <th>Montant (€)</th>
              <th>Total anticipé</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brutRows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input style={{ width: 400 }} type="text"></input>
                </td>
                <td>
                  <input
                    type="number"
                    value={row.frais}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChange(
                        brutRows,
                        setBrutRows,
                        index,
                        'frais',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </td>
                <td>
                  <Money value={row.total} />
                </td>
                <td>
                  <button onClick={() => addRow(brutRows, setBrutRows)}>+</button>
                  <button onClick={() => removeRow(brutRows, setBrutRows, index)}>-</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="total-box">
          <strong>Total : </strong> <Money value={getTotalSum(brutRows, 'total')}/>
        </div>
      </div>
    </div>
  )
}

export default ITP
