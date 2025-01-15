import IPPersonnelCapForm from '@renderer/form/incapacite_perma/personnel_cap'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useState } from 'react'

const PersonnelCap = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_perma_personnel_cap: values })
    },
    [setData]
  )
  const createRow = () => ({
    debutippc: '',
    finippc: '',
    joursippc: '',
    indemnite: 32,
    pourcentageippc: '',
    totalippc: ''
  })

  const [ippcRows, setIppcRows] = useState([createRow()])
  const [brutRows, setBrutRows] = useState([createRow()])
  const [datePaiement, setDatePaiement] = useState('')

  const calculateRowIppc = (row) => {
    const { debutippc, finippc, indemnite, pourcentageippc } = row
    let joursippc = ''
    let totalippc = ''

    if (debutippc && finippc) {
      const debutDate = new Date(debutippc)
      const finDate = new Date(finippc)

      if (!isNaN(debutDate) && !isNaN(finDate)) {
        const timeDiff = finDate.getTime() - debutDate.getTime()
        joursippc = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1)

        if (indemnite && pourcentageippc) {
          totalippc = (joursippc * indemnite * (pourcentageippc / 100)).toFixed(2)
        }
      }
    }

    return { joursippc, totalippc }
  }

  const handleInputChangeIppc = (index, field, value) => {
    const updatedRows = [...ippcRows]
    updatedRows[index][field] = value

    const { joursippc, totalippc } = calculateRowIppc(updatedRows[index])
    updatedRows[index].joursippc = joursippc
    updatedRows[index].totalippc = totalippc

    setIppcRows(updatedRows)
  }

  const handleDatePaiementChange = (value) => {
    setDatePaiement(value)

    const updatedIppcRows = ippcRows.map((row) => ({
      ...row,
      finippc: value
    }))
    setIppcRows(updatedIppcRows)

    const updatedBrutRows = brutRows.map((row) => ({
      ...row,
      finippc: value
    }))
    setBrutRows(updatedBrutRows)
  }

  const getTotalSum = (rows, field) =>
    rows.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0).toFixed(2)

  const getTotalSumAll = () => {
    const totalIppc = parseFloat(getTotalSum(ippcRows, 'totalippc')) || 0
    const totalBrut = parseFloat(getTotalSum(brutRows, 'totalippc')) || 0
    return (totalIppc + totalBrut).toFixed(2)
  }

  return (
    <div id="content">
      <div id="main">
        <IPPersonnelCapForm
          onSubmit={saveData}
          initialValues={data?.incapacite_perma_personnel_cap}
        />

        <h1>Incapacités permanentes personnelles capitalisées</h1>
        <h3>Variables du calcul de capitalisation</h3>
        <table id="IPVariables">
          <tbody>
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
          </tbody>
        </table>

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
                <td>
                  <input
                    type="date"
                    value={row.debutippc}
                    onChange={(e) => handleInputChangeIppc(index, 'debutippc', e.target.value)}
                  />
                </td>
                <td>
                  <input type="date" value={row.finippc} readOnly />
                </td>
                <td>{row.joursippc}</td>
                <td>
                  <input
                    type="number"
                    value={row.indemnite}
                    onChange={(e) =>
                      handleInputChangeIppc(index, 'indemnite', parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.pourcentageippc}
                    onChange={(e) =>
                      handleInputChangeIppc(
                        index,
                        'pourcentageippc',
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </td>
                <td>{row.totalippc}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Incapacités personnelles permanentes</h3>
        <table id="IPCAPTable">
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
                <td>
                  <input type="date" value={datePaiement} readOnly />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.indemnite}
                    onChange={(e) =>
                      handleInputChangeIppc(index, 'indemnite', parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.pourcentageippc}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChangeIppc(
                        index,
                        'pourcentageippc',
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </td>
                <td>{row.totalippc}</td>
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

export default PersonnelCap
