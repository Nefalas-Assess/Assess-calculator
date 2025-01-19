import React, { useCallback, useContext } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import ITMenagereForm from '@renderer/form/incapacite_temp/menagère'
import TotalBox from '@renderer/generic/totalBox'

const Menagere = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_temp_menagere: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <ITMenagereForm onSubmit={saveData} initialValues={data?.incapacite_temp_menagere} />
        <TotalBox label="Total général :" />
        <TotalBox name="interest" />
      </div>
    </div>
  )
}

export default Menagere
