import PretiumDolorisForm from '@renderer/form/incapacite_temp/pretium_doloris'
import TotalBox from '@renderer/generic/totalBox'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useState } from 'react'

const PretiumDoloris = () => {
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
        <TotalBox label="Total général :" />
        <TotalBox label="Total intérêts :" name="interest" />
      </div>
    </div>
  )
}

export default PretiumDoloris
