import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import ITPersonnelForm from '@renderer/form/incapacite_temp/personnel'

const Personnel = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_temp_personnel: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <ITPersonnelForm onSubmit={saveData} initialValues={data?.incapacite_temp_personnel} />
      </div>
    </div>
  )
}

export default Personnel
