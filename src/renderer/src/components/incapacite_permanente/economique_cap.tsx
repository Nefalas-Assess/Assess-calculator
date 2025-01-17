import IPEcoCapForm from '@renderer/form/incapacite_perma/economique_cap'
import Money from '@renderer/generic/money'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useState } from 'react'

const IPEC = () => {
  const createRow = () => ({
    debut: '',
    salaire: '',
    pourcentage: '',
    jours: '',
    total: ''
  })

  // Section Période entre la consolidation et le paiement
  const [brutRows, setBrutRows] = useState([createRow()]) // Période entre la consolidation et le paiement
  const [netRows, setNetRows] = useState([createRow()]) // Période entre la consolidation et le paiement

  // Section Incapacités économiques permanentes
  const [itebRows, setItebRows] = useState([createRow()]) // Incapacités économiques permanentes (Brut)
  const [itenRows, setItenRows] = useState([createRow()]) // Incapacités économiques permanentes (Net)

  const calculateRowWithCoefficient = (row, paymentDate, isNet = false) => {
    const { salaire, pourcentage } = row
    let total = ''
    let jours = ''

    if (row.debut && paymentDate) {
      const dateDebut = new Date(row.debut)
      const datePaiement = new Date(paymentDate)
      jours = Math.max(0, (datePaiement - dateDebut) / (1000 * 60 * 60 * 24) + 1) // Différence en jours
    }

    if (salaire && pourcentage && jours) {
      total = ((jours * salaire * pourcentage) / 365).toFixed(2)
    }

    if (isNet) {
      total = (parseFloat(total) * coefficient).toFixed(2)
    } else {
      total = (parseFloat(total) * coefficient).toFixed(2)
    }

    return { total, jours }
  }

  // Période entre la consolidation et le paiement
  const handleInputChangeBrut = (rows, setRows, index, field, value, paymentDate) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value

    const { total, jours } = calculateRow(updatedRows[index], paymentDate)
    updatedRows[index].total = total
    updatedRows[index].jours = jours

    setRows(updatedRows)
  }

  const handleInputChangeNet = (rows, setRows, index, field, value, paymentDate) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value

    const { total, jours } = calculateRow(updatedRows[index], paymentDate)
    updatedRows[index].total = total
    updatedRows[index].jours = jours

    setRows(updatedRows)
  }

  const handleInputChangeIteb = (rows, setRows, index, field, value, paymentDate) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value

    const { total, jours } = calculateRowWithCoefficient(updatedRows[index], paymentDate)
    updatedRows[index].total = total
    updatedRows[index].jours = jours

    setRows(updatedRows)
  }

  const handleInputChangeIten = (rows, setRows, index, field, value, paymentDate) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value

    const { total, jours } = calculateRowWithCoefficient(updatedRows[index], paymentDate, true) // true pour net
    updatedRows[index].total = total
    updatedRows[index].jours = jours

    setRows(updatedRows)
  }

  const [paymentDate, setPaymentDate] = useState('')
  const [coefficient, setCoefficient] = useState(1) // Coefficient à définir

  const getTotalSum = (rows, field) =>
    rows.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0).toFixed(2)

  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_perma_economique_cap: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <IPEcoCapForm onSubmit={saveData} initialValues={data?.incapacite_perma_economique_cap} />

        {/* <table id="itebTable">
          <thead>
            <tr>
              <th>Salaire annuel brut (€)</th>
              <th style={{ width: 50 }}>%</th>
              <th>Total Brut</th>
            </tr>
          </thead>
          <tbody>
            {itebRows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="number"
                    value={row.salaire}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChangeIteb(
                        itebRows,
                        setItebRows,
                        index,
                        'salaire',
                        parseFloat(e.target.value),
                        paymentDate
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value={row.pourcentage}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChangeIteb(
                        itebRows,
                        setItebRows,
                        index,
                        'pourcentage',
                        parseFloat(e.target.value),
                        paymentDate
                      )
                    }
                  />
                </td>
                <td>
                  <Money value={row.total} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table id="itenTable">
          <thead>
            <tr>
              <th>Salaire annuel net (€)</th>
              <th style={{ width: 50 }}>%</th>
              <th>Total Net</th>
            </tr>
          </thead>
          <tbody>
            {itenRows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="number"
                    value={row.salaire}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChangeIteb(
                        itenRows,
                        setItenRows,
                        index,
                        'salaire',
                        parseFloat(e.target.value),
                        paymentDate
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    style={{ width: 50 }}
                    type="number"
                    value={row.pourcentage}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChangeIteb(
                        itenRows,
                        setItenRows,
                        index,
                        'pourcentage',
                        parseFloat(e.target.value),
                        paymentDate
                      )
                    }
                  />
                </td>
                <td>
                  <Money value={row.total} />
                </td>
              </tr>
            ))}
          </tbody>
        </table> */}
      </div>
    </div>
  )
}

export default IPEC