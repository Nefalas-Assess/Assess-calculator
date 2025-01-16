import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import Money from '@renderer/generic/money'

const IPMC = () => {
  const createRow = () => ({
    debut: '',
    fin: '',
    jours: '',
    indemnite: 30,
    coefficient: 0,
    pourcentage: 0,
    total: ''
  })

  const createRowHeures = () => ({
    heures: '',
    total: ''
  })

  const [rows, setRows] = useState([createRow()])
  const [rowsHeures, setRowsHeures] = useState([createRowHeures()])
  const [datePaiement, setDatePaiement] = useState('')

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value

    if (field === 'debut' || field === 'fin') {
      const jours = calculateDays(updatedRows[index].debut, updatedRows[index].fin)
      updatedRows[index].jours = jours
    }

    const total = calculateTotal(
      updatedRows[index].jours || 0,
      parseFloat(updatedRows[index].indemnite) || 30,
      parseFloat(updatedRows[index].coefficient) || 0,
      parseFloat(updatedRows[index].pourcentage) || 0
    )
    updatedRows[index].total = total

    setRows(updatedRows)
  }

  const handleInputChangeHeures = (index, field, value) => {
    const updatedRowsHeures = [...rowsHeures]
    updatedRowsHeures[index][field] = value

    if (field === 'heures') {
      const total = (parseFloat(value) * 11.5 * 365).toFixed(2)
      updatedRowsHeures[index].total = isNaN(total) ? '' : total
    }

    setRowsHeures(updatedRowsHeures)
  }

  const calculateDays = (debut, fin) => {
    if (!debut || !fin) return ''
    const debutDate = new Date(debut)
    const finDate = new Date(fin)

    if (!isNaN(debutDate) && !isNaN(finDate)) {
      return Math.max(0, (finDate - debutDate) / (1000 * 60 * 60 * 24))
    }
    return ''
  }

  const calculateTotal = (jours, indemnite, coefficient, pourcentage) => {
    return (jours * indemnite * (coefficient / 100) * (pourcentage / 100)).toFixed(2)
  }

  const getTotalSumAll = () => {
    const totalRows = rows.reduce((sum, row) => sum + parseFloat(row.total || 0), 0)
    const totalHeures = rowsHeures.reduce((sum, row) => sum + parseFloat(row.total || 0), 0)
    return (totalRows + totalHeures).toFixed(2)
  }

  const handleDatePaiementChange = (value) => {
    setDatePaiement(value)

    // Synchronisation automatique
    const updatedRows = rows.map((row) => ({ ...row, fin: value }))
    setRows(updatedRows)
  }

  return (
    <div id="content">
      <div id="main">
        <h1>Incapacités permanentes ménagères capitalisées</h1>
        <h3>Variables du calcul de capitalisation</h3>
        <table id="IPVariables">
          <tr>
            <td>Tables de référence</td>
            <td>
              <select>
                <option>Schryvers 2024 rente viagère de 1€/an mensuelle</option>
                <option></option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Taux d'intérêt de la capitalisation</td>
            <td>
              <select defaultValue="">
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
          <tr>
            <td>Date du paiement</td>
            <td>
              <input
                type="date"
                value={datePaiement}
                onChange={(e) => handleDatePaiementChange(e.target.value)}
              />
            </td>
          </tr>
        </table>

        <h3>Période entre la consolidation et le paiement</h3>
        <table id="ipmcTable">
          <thead>
            <tr>
              <th>Date de consolidation</th>
              <th>Date du paiement</th>
              <th>Jours</th>
              <th>Indemnité journalière (€)</th>
              <th>Contribution</th>
              <th style={{ width: 50 }}>%</th>
              <th>Total</th>
              <th className="int">Intérêts</th>
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
                  <input type="date" value={datePaiement} readOnly />
                </td>
                <td>{row.jours}</td>
                <td>
                  <input
                    type="number"
                    value={row.indemnite}
                    min="0"
                    onChange={(e) => handleInputChange(index, 'indemnite', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={row.coefficient}
                    onChange={(e) => handleInputChange(index, 'coefficient', e.target.value)}
                  >
                    <option value="0">0</option>
                    <option value="100">100</option>
                    <option value="65">65</option>
                    <option value="50">50</option>
                    <option value="35">35</option>
                  </select>
                </td>
                <td>
                  <input style={{ width: 50 }}
                    type="number"
                    value={row.pourcentage}
                    min="0"
                    max="100"
                    onChange={(e) => handleInputChange(index, 'pourcentage', e.target.value)}
                  />
                </td>
                <td>
                  <Money value={row.total} />
                </td>
                <td className="int">Nombre de jours entre [Date médiane entre (Début Fin) & Date du paiement] * Total * (%int de infog / 365)</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Incapacités ménagères permanentes</h3>
        <table id="IPCAPTable">
          <thead>
            <tr>
              <th>Date du paiement</th>
              <th>Indemnité journalière (€)</th>
              <th>Contribution</th>
              <th style={{ width: 50 }}>%</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input type="date" value={datePaiement} readOnly />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.indemnite}
                    min="0"
                    onChange={(e) => handleInputChange(index, 'indemnite', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={row.coefficient}
                    onChange={(e) => handleInputChange(index, 'coefficient', e.target.value)}
                  >
                    <option value="0">0</option>
                    <option value="100">100</option>
                    <option value="65">65</option>
                    <option value="50">50</option>
                    <option value="35">35</option>
                  </select>
                </td>
                <td>
                  <input style={{ width: 50 }}
                    type="number"
                    value={row.pourcentage}
                    min="0"
                    max="100"
                    onChange={(e) => handleInputChange(index, 'pourcentage', e.target.value)}
                  />
                </td>
                <td>
                  <Money value={row.total} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Aide de tiers (non-qualifiés)</h3>
        <table id="hospTable">
          <thead>
            <tr>
              <th>Nombre d'heures par jour</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rowsHeures.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={row.heures}
                    onChange={(e) => handleInputChangeHeures(index, 'heures', e.target.value)}
                  />
                </td>
                <td>
                  <Money value={row?.total} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="total-box">
          <strong>Total : </strong> {getTotalSumAll()} €
        </div>
      </div>
    </div>
  )
}

export default IPMC
