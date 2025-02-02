import React, { useCallback, useContext } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import InfoForm from '@renderer/form/info_general_form'

const InfoG = ({ editable }) => {
  const { setData, data } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ general_info: values })
    },
    [setData, data]
  )

  return (
    <div id="content">
      <div id="main">
        <h1>Informations générales</h1>
        <InfoForm onSubmit={saveData} editable={editable} initialValues={data?.general_info} />
      </div>
    </div>
  )
}

export default InfoG
