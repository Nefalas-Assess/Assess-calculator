import PretiumDolorisForm from '@renderer/form/incapacite_temp/pretium_doloris'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useState } from 'react'

const EFFA = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ pretium_doloris: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <PretiumDolorisForm onSubmit={saveData} initialValues={data?.pretium_doloris} />
      </div>
    </div>
  )
}

export default EFFA
