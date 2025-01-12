import React, { useState } from 'react';

const ITP = () => {
    const createRow = () => ({
        coefficient: '',
        salaire: '',
        pourcentage: '',
        total: '',
      });

  const [brutRows, setBrutRows] = useState([createRow()]);
  const [netRows, setNetRows] = useState([createRow()]);

  const calculateRow = (row) => {
    const { coefficient, salaire, pourcentage } = row;
    let total = '';

    if (coefficient && salaire && pourcentage) {
      total = (
        coefficient *
        salaire *
        (pourcentage / 100)
      ).toFixed(2);
    }

    return { total };
  };

  const handleInputChange = (rows, setRows, index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    const { total } = calculateRow(updatedRows[index]);
    updatedRows[index].total = total;

    setRows(updatedRows);
  };

  const addRow = (rows, setRows) => {
    setRows([...rows, createRow()]);
  };

  const removeRow = (rows, setRows, index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const getTotalSum = (rows, field) =>
    rows.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0).toFixed(2);


  return (
    <div id="content">
      <div id="main">

        <h1>Variables</h1>
        <table id="IPVariables">
          <tr>
            <td>Tables de référence</td>
            <td>
              <select
                defaultValue=""
                onChange={(e) => handleInputChange(index, 'table', e.target.value)}
              >
                <option value="" disabled>
                  Sélectionnez
                </option>
                <option>Schryvers 2024</option>
                <option>Levie</option>
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
              </select></td>
          </tr>
          <tr>
            <td>Âge de la retraite</td>
            <td>
              <select
                defaultValue=""
                onChange={(e) => handleInputChange(index, 'retraite', e.target.value)}
              >
                <option value="" disabled>
                  Sélectionnez
                </option>
                <option></option>
                <option></option>
              </select></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
          </tr>
        </table>

        <h1>Incapacités permanentes économiques</h1>

        {/* Tableau Salaire annuel brut */}
        <table id="itebTable">
          <thead>
            <tr>
              <th>Coefficient</th>
              <th>Salaire annuel brut (€)</th>
              <th>%</th>
              <th>Total Brut (€)</th>
            </tr>
          </thead>
          <tbody>
            {brutRows.map((row, index) => (
              <tr key={index}>
                <td></td>
                <td>
                  <input
                    type="number"
                    value={row.salaire}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChange(brutRows, setBrutRows, index, 'salaire', parseFloat(e.target.value))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.pourcentage}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChange(brutRows, setBrutRows, index, 'pourcentage', parseFloat(e.target.value))
                    }
                  />
                </td>
                <td>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="total-box">
          <strong>Total Brut : </strong> {getTotalSum(brutRows, 'total')} €
        </div>

        {/* Tableau Salaire annuel net */}
        <table id="itenTable">
          <thead>
            <tr>
              <th>Coefficient</th>
              <th>Salaire annuel net (€)</th>
              <th>%</th>
              <th>Total Net (€)</th>
            </tr>
          </thead>
          <tbody>
            {netRows.map((row, index) => (
              <tr key={index}>
                <td></td>
                <td>
                  <input
                    type="number"
                    value={row.salaire}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChange(netRows, setNetRows, index, 'salaire', parseFloat(e.target.value))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.pourcentage}
                    step="0.01"
                    onChange={(e) =>
                      handleInputChange(netRows, setNetRows, index, 'pourcentage', parseFloat(e.target.value))
                    }
                  />
                </td>
                <td>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="total-box">
          <strong>Total Net : </strong> {getTotalSum(netRows, 'total')} €
        </div>
      </div>
    </div>
  );
};

export default ITP;