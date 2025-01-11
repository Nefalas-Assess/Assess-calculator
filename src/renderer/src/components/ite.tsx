import React, { useState } from 'react';

const ITP = () => {
  const createRow = () => ({
    debut: '',
    fin: '',
    jours: '',
    salaire: '',
    pourcentage: '',
    total: '',
  });

  const [brutRows, setBrutRows] = useState([createRow()]);
  const [netRows, setNetRows] = useState([createRow()]);

  const calculateRow = (row) => {
    const { debut, fin, salaire, pourcentage } = row;
    let jours = '';
    let total = '';

    if (debut && fin) {
      const debutDate = new Date(debut);
      const finDate = new Date(fin);

      if (!isNaN(debutDate) && !isNaN(finDate)) {
        const timeDiff = finDate.getTime() - debutDate.getTime();
        jours = Math.max(0, timeDiff / (1000 * 3600 * 24) + 1);

        if (salaire && pourcentage) {
          total = (
            jours *
            (salaire / 365) *
            (pourcentage / 100)
          ).toFixed(2);
        }
      }
    }

    return { jours, total };
  };

  const handleInputChange = (rows, setRows, index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    const { jours, total } = calculateRow(updatedRows[index]);
    updatedRows[index].jours = jours;
    updatedRows[index].total = total;

    setRows(updatedRows);
  };

  const addRow = (rows, setRows) => {
    const newRow = createRow();
  
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
  
      // Pré-remplir les valeurs de la nouvelle ligne avec celles de la dernière ligne
      newRow.salaire = lastRow.salaire;
      newRow.pourcentage = lastRow.pourcentage;
  
      // Pré-remplir la date de début avec la date de fin de la dernière ligne +1 jour
      const lastRowFin = lastRow.fin;
      if (lastRowFin) {
        const finDate = new Date(lastRowFin);
        if (!isNaN(finDate)) {
          finDate.setDate(finDate.getDate() + 1);
          newRow.debut = finDate.toISOString().split('T')[0];
        }
      }
    }
  
    setRows([...rows, newRow]);
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
        <h1>Incapacités temporaires économiques</h1>

        {/* Tableau Salaire annuel brut */}
        <table id="itebTable">
          <thead>
            <tr>
              <th>Début</th>
              <th>Fin</th>
              <th>Jours</th>
              <th>Salaire annuel brut (€)</th>
              <th>%</th>
              <th>Total Brut (€)</th>
              <th></th>
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
                      handleInputChange(brutRows, setBrutRows, index, 'debut', e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={row.fin}
                    onChange={(e) =>
                      handleInputChange(brutRows, setBrutRows, index, 'fin', e.target.value)
                    }
                  />
                </td>
                <td>{row.jours}</td>
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
                <td>
                  <button onClick={() => addRow(brutRows, setBrutRows)}>+</button>
                  <button onClick={() => removeRow(brutRows, setBrutRows, index)}>-</button>
                </td>
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
              <th>Début</th>
              <th>Fin</th>
              <th>Jours</th>
              <th>Salaire annuel net (€)</th>
              <th>%</th>
              <th>Total Net (€)</th>
              <th></th>
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
                      handleInputChange(netRows, setNetRows, index, 'debut', e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={row.fin}
                    onChange={(e) =>
                      handleInputChange(netRows, setNetRows, index, 'fin', e.target.value)
                    }
                  />
                </td>
                <td>{row.jours}</td>
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
                <td>
                  <button onClick={() => addRow(netRows, setNetRows)}>+</button>
                  <button onClick={() => removeRow(netRows, setNetRows, index)}>-</button>
                </td>
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