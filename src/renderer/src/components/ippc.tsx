import React, { useState } from 'react'

const IPPC = () => {
  const createRow = () => ({
    coefficient: '',
    indemnite: '32',
    pourcentage: '',
    pourcentageippc: '',
    total: ''
  })

  const createRowippc = () => ({
    coefficient: '',
    indemnite: '32',
    pourcentage: '',
    pourcentageippc: '',
    total: ''
  })

  const [brutRows, setBrutRows] = useState([createRow()])
  const [ippcRows, setippcRows] = useState([createRowippc()])

  // Pour le tableau de capitalisation
  const calculateRow = (row) => {
    const { coefficient, indemnite, pourcentage } = row
    let total = ''

    if (coefficient && indemnite && pourcentage) {
      total = (coefficient * indemnite * 365 * pourcentage).toFixed(2)
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

  const getTotalSum = (rows, field) =>
    rows.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0).toFixed(2)

  // Pour le tableau [conso-paiement]
  const calculateRowippc = (row) => {
    const { joursippc, indemnite, pourcentageippc } = row
    let totalippc = ''

    if (joursippc && indemnite && pourcentageippc) {
      totalippc = (joursippc * indemnite * pourcentageippc).toFixed(2)
    }

    return { totalippc }
  }

  const handleInputChangeippc = (rows, setRows, index, field, value) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value

    const { totalippc } = calculateRowippc(updatedRows[index])
    updatedRows[index].total = totalippc

    setRows(updatedRows)
  }

  const getTotalSumippc = (rows, field) =>
    rows.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0).toFixed(2)

  return (
    <div id="content">
      <div id="main">
        <h1>Incapacités permanentes personnelles</h1>
        <h3>Période entre la consolidation et le paiement</h3>
        <table id="ippcTable">
          <thead>
            <tr>
              <th>Date de consolidation</th>
              <th>Date du paiement</th>
              <th>Jours</th>
              <th>Indemnité journalière (€)</th>
              <th>%</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {ippcRows.map((row, index) => (
              <tr key={index}>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <input
                    type="number"
                    value={row.indemnite}
                    onChange={(e) =>
                      handleInputChange(index, 'indemnite', parseFloat(e.target.value))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.pourcentageippc}
                    onChange={(e) =>
                      handleInputChange(index, 'pourcentageippc', parseFloat(e.target.value))
                    }
                  />
                </td>
                <td>{row?.totalippc}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Variables du calcul de capitalisation</h3>
        <table id="IPVariables">
          <tr>
            <td>Tables de référence</td>
            <td>
              <select onChange={(e) => handleInputChange(index, 'table', e.target.value)}>
                <option>
                  Schryvers 2024 | VA rente viagère de 1 euro par an payable mensuellement
                </option>
                <option></option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Taux d'intérêt de la capitalisation</td>
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
                <option>3</option>
              </select>
            </td>
          </tr>
        </table>

        <h3>Incapacités personnelles permanentes</h3>

        <table id="ippcTable">
          <thead>
            <tr>
              <th>Date du paiement</th>
              <th>Indemnité journalière (€)</th>
              <th>%</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {brutRows.map((row, index) => (
              <tr key={index}>
                <td></td>
                <td>
                  <input
                    type="number"
                    value={row.indemnite}
                    onChange={(e) =>
                      handleInputChange(
                        brutRows,
                        setBrutRows,
                        index,
                        'indemnité',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.pourcentage}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChange(
                        brutRows,
                        setBrutRows,
                        index,
                        'pourcentage',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </td>
                <td>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="total-box">
          <strong>Total : </strong> {getTotalSum(brutRows, 'total')} €
        </div>
      </div>
    </div>
  )
}

export default IPPC
