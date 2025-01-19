import PrejudiceProcheForm from '@renderer/form/deces/prejudice_proche'
import Money from '@renderer/generic/money'
import TotalBox from '@renderer/generic/totalBox'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useState } from 'react'

const PrejudiceProche = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ prejudice_proche: values })
    },
    [setData]
  )
  return (
    <div id="content">
      <div id="main">
        <PrejudiceProcheForm onSubmit={saveData} initialValues={data?.prejudice_proche} />
        <TotalBox label="Total général :" />
      </div>
    </div>
  )
}

export default PrejudiceProche
