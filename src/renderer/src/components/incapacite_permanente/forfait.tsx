import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import ForfaitForm from '@renderer/form/incapacite_perma/forfait'
import TotalBox from '@renderer/generic/totalBox'

const Forfait = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ forfait_ip: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <ForfaitForm onSubmit={saveData} initialValues={data?.forfait_ip} />
        <TotalBox label="Total général :" />
        <TotalBox label="Total intérêts :" name="interest" />
      </div>
    </div>
  )
}

export default Forfait
