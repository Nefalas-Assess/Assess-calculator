import HospitalisationForm from '@renderer/form/hospitalisation'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useState } from 'react'

const ITP = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ hospitalisation: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <HospitalisationForm onSubmit={saveData} initialValues={data?.hospitalisation} />
      </div>
    </div>
  )
}

export default ITP
