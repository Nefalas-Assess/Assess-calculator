import React, { useCallback, useContext } from 'react'
import InfoForm from '../form/info_general_form'
import { AppContext } from '@renderer/providers/AppProvider'

const ITP = () => {
  const { setData, data } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ general_info: values })
    },
    [setData]
  )

  console.log(data)

  return (
    <div id="content">
      <div id="top-menu">
        <button
          onClick={() => {
            /* saveData logic */
          }}
        >
          Sauvegarder
        </button>
        <input
          type="file"
          id="loadFileInput"
          style={{ display: 'none' }}
          onChange={() => {
            /* loadData logic */
          }}
        />
        <button onClick={() => document.getElementById('loadFileInput').click()}>Charger</button>
      </div>

      <div id="main">
        <h1>Informations générales</h1>
        <InfoForm onSubmit={saveData} initialValues={data?.general_info} />
      </div>
    </div>
  )
}

export default ITP
