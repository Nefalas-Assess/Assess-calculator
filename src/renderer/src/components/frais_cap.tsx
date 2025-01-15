import React, { useState } from 'react'

const Frais_cap = () => {



    
  return (
    <div id="content">
      <div id="main">
        <h1>Frais capitalisés</h1>
        <table id="FraisCapTable">
          <thead>
            <tr>
              <th>Frais</th>
              <th>Date du paiement</th>
              <th>Table de référence</th>
              <th>Taux d'intérêt de la capitalisation</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {fraisRows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input type="text" defaultValue={row.frais} />
                </td>
                <td>
                  <input type="date" defaultValue={row.date} />
                </td>
                <td>
                  <select defaultValue={row.reference}>
                    <option>Schryvers 2024 | VA rente viagère de 1 euro par an mensuel</option>
                    <option>
                      Schryvers 2024 | VA rente viagère de 1 euro par an mensuel (65 ans)
                    </option>
                    <option>
                      Schryvers 2024 | VA rente viagère de 1 euro par an mensuel (66 ans)
                    </option>
                    <option>
                      Schryvers 2024 | VA rente viagère de 1 euro par an mensuel (67 ans)
                    </option>
                    <option>
                      Schryvers 2024 | VA rente viagère de 1 euro par an mensuel (68 ans)
                    </option>
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
                  <input type="number" defaultValue={row.total} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Frais_cap
