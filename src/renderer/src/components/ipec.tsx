import Money from '@renderer/generic/money'
import React, { useState } from 'react'

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

  return (
    <div id="content">
      <div id="main">
        <h1>Incapacités permanentes économiques capitalisées</h1>
        <h3>Variables du calcul de capitalisation</h3>
        <table id="IPVariables">
          <tr>
            <td>Tables de référence</td>
            <td>
              <select>
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
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </td>
          </tr>
        </table>

        <h3>Période entre la consolidation et le paiement</h3>

        {/* Tableau Salaire annuel brut pour la Période entre la consolidation et le paiement */}
        <table id="ipecBrutTable">
          <thead>
            <tr>
              <th>Date de consolidation</th>
              <th>Date du paiement</th>
              <th>Jours</th>
              <th>Salaire annuel brut (€)</th>
              <th>%</th>
              <th>Total Brut</th>
            </tr>
          </thead>
          <tbody>
            {brutRows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="date"
                    value={row.debut}
                    onChange={(e) =>
                      handleInputChangeBrut(
                        brutRows,
                        setBrutRows,
                        index,
                        'debut',
                        e.target.value,
                        paymentDate
                      )
                    }
                  />
                </td>
                <td>
                  <input type="date" value={paymentDate} readOnly />
                </td>
                <td>{row.jours}</td>
                <td>
                  <input
                    type="number"
                    value={row.salaire}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChangeBrut(
                        brutRows,
                        setBrutRows,
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
                    type="number"
                    value={row.pourcentage}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChangeBrut(
                        brutRows,
                        setBrutRows,
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

        {/* Tableau Salaire annuel net */}
        <table id="ipecNetTable">
          <thead>
            <tr>
              <th>Date de consolidation</th>
              <th>Date du paiement</th>
              <th>Jours</th>
              <th>Salaire annuel net (€)</th>
              <th>%</th>
              <th>Total Net</th>
            </tr>
          </thead>
          <tbody>
            {netRows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="date"
                    value={row.debut}
                    onChange={(e) =>
                      handleInputChangeBrut(
                        netRows,
                        setNetRows,
                        index,
                        'debut',
                        e.target.value,
                        paymentDate
                      )
                    }
                  />
                </td>
                <td>
                  <input type="date" value={paymentDate} readOnly />
                </td>
                <td>{row.jours}</td>
                <td>
                  <input
                    type="number"
                    value={row.salaire}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChangeBrut(
                        netRows,
                        setNetRows,
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
                    type="number"
                    value={row.pourcentage}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChangeBrut(
                        netRows,
                        setNetRows,
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

        <h3>Incapacités économiques permanentes</h3>

        {/* Tableau Salaire annuel brut pour Incapacités économiques permanentes */}
        <table id="itebTable">
          <thead>
            <tr>
              <th>Salaire annuel brut (€)</th>
              <th>%</th>
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

        {/* Tableau Salaire annuel net pour Incapacités économiques permanentes */}
        <table id="itenTable">
          <thead>
            <tr>
              <th>Salaire annuel net (€)</th>
              <th>%</th>
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
        </table>
        {/* <div>
          <label>Coefficient</label>
          <input
            type="number"
            step="0.01"
            value={coefficient}
            onChange={(e) => setCoefficient(parseFloat(e.target.value))}
          />
        </div> */}
      </div>
    </div>
  )
}

export default IPEC
