import React, { useCallback, useContext } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import ITEconomiqueForm from '@renderer/form/incapacite_temp/economique'
import TotalBox from '@renderer/generic/totalBox'

const Economique = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_temp_economique: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <ITEconomiqueForm onSubmit={saveData} initialValues={data?.incapacite_temp_economique} />
        <TotalBox label="Total général :" />
        <TotalBox label="Total intérêts :" name="interest" />
      </div>
    </div>
  )
}

export default Economique
