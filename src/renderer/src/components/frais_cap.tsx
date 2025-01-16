import Money from '@renderer/generic/money'
import React, { useState } from 'react'

const Frais_cap = () => {
  const createRow = () => ({
    frais: '',
    date: '',
    reference: '',
    taux: '',
    total: ''
  })

  // Initialize the rows state with one row by default
  const [rows, setRows] = useState([createRow()])

  // Function to add a new row
  const addRow = () => {
    setRows([...rows, createRow()])
  }

  // Function to remove a row
  const removeRow = (index) => {
    const newRows = rows.filter((_, rowIndex) => rowIndex !== index)
    setRows(newRows)
  }

  // Function to handle the change of a value in the "Total (€)" column
  const handleTotalChange = (value, index) => {
    const newRows = [...rows]
    newRows[index].total = value
    setRows(newRows)
  }

  // Calculate the total sum of the "Total (€)" column
  const totalSum = rows.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0)

  return (
    <div id="content">
      <div id="main">
        <h1>Frais capitalisés</h1>
        <table id="FraisCapTable">
          <thead>
            <tr>
              <th>Frais annualisé(s)</th>
              <th>Date du paiement</th>
              <th className="custom-size">Table de référence</th>
              <th>Taux d'intérêt de la capitalisation</th>
              <th>Montant (€)</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input type="text" defaultValue={row.frais} />
                </td>
                <td>
                  <input type="date" defaultValue={row.date} />
                </td>
                <td className="custom-size">
                  <select defaultValue={row.reference}>
                    <option>Schryvers 2024 rente viagère de 1€/an mensuelle</option>
                    <option>Schryvers 2024 rente viagère de 1€/an mensuelle (65 ans)</option>
                    <option>Schryvers 2024 rente viagère de 1€/an mensuelle (66 ans)</option>
                    <option>Schryvers 2024 rente viagère de 1€/an mensuelle (67 ans)</option>
                    <option>Schryvers 2024 rente viagère de 1€/an mensuelle (68 ans)</option>
                    <option>Schryvers 2024 rente viagère de 1€/an mensuelle (69 ans)</option>
                    <option>Schryvers 2024 rente viagère de 1€/an mensuelle (70 ans)</option>
                    <option>Schryvers 2024 rente viagère de 1€/an mensuelle (71 ans)</option>
                    <option>Schryvers 2024 rente viagère de 1€/an mensuelle (72 ans)</option>
                    <option>Schryvers 2024 rente viagère de 1€/an mensuelle (73 ans)</option>
                    <option>Schryvers 2024 rente viagère de 1€/an mensuelle (74 ans)</option>
                    <option>Schryvers 2024 rente viagère de 1€/an mensuelle (75 ans)</option>
                  </select>
                </td>
                <td>
                  <select defaultValue={row.taux}>
                    <option value="">Sélectionnez</option>
                    <option>0.5</option>
                    <option>0.8</option>
                    <option>1</option>
                    <option>1.5</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </td>
                <td>
                  <input type="number"/>
                </td>
                <td>
                  <Money value={row.total}/>
                </td>
                <td>
                  <button onClick={() => removeRow(index)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addRow}>Ajouter une ligne</button>
      </div>
      <div className="total-box">
        <strong>Total : </strong>
        <Money value={totalSum.toFixed(2)}/>
      </div>
    </div>
  )
}

export default Frais_cap
