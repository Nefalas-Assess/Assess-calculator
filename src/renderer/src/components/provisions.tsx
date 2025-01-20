import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import TotalBox from '@renderer/generic/totalBox'
import Interest from '@renderer/generic/interet'

export const Provisions = () => {
 

  return (
    <div id="content">
      <h1>Provisions</h1>
      <table style={{ width: 700 }}>
        <thead>
          <tr>
            <th>Date de provision</th>
            <th>Montant</th>
            <th className="int">Date du paiement</th>
            <th className="int">Intérêts (€)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {ProvFields?.fields.map((child, index) => (
            <tr key={child.id}>
              <td>
                <input type="date" {...register(`prov.${index}.date_provision`)} />
              </td>
              <td>
                <input type="number" {...register(`prov.${index}.amount`)} />
              </td>
              <td className="int">
                <input type="date" {...register(`prov.${index}.date_paiement`)} />
              </td>
              <td className="int">
                <Interest/>Calculer des intérêts négatifs à partir de la date_provision jusqu'à date_paiement. Pareil pour le montant, il doit apparaître en négatif dans la totalbox.
              </td>
              <td>
                <button>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button>Ajouter provisions</button>
      <div className="total-box">
        <strong>Total frais médicaux : </strong> <Money value={totalSumProv} />
      </div>
    </div>
  )
}

export default Provisions