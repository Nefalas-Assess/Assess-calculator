import IPPersonnelCapForm from '@renderer/form/incapacite_perma/personnel_cap'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useState } from 'react'

const PersonnelCap = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_perma_personnel_cap: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <IPPersonnelCapForm
          onSubmit={saveData}
          initialValues={data?.incapacite_perma_personnel_cap}
        />
      </div>
    </div>
  )
}

export default PersonnelCap
