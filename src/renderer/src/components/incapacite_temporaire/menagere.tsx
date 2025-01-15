import React, { useCallback, useContext } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import ITMenagereForm from '@renderer/form/incapacite_temp/menagère'

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
      </div>
    </div>
  )
}

export default Menagere
