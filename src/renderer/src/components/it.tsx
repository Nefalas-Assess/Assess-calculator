import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import IncapaciteTemporaireForm from '@renderer/form/incapacite_temporaire'

const IT = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_temp: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <IncapaciteTemporaireForm onSubmit={saveData} initialValues={data?.incapacite_temp} />
      </div>
    </div>
  )
}

export default IT
