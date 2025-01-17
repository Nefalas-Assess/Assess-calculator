import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import Money from '@renderer/generic/money'
import IPMenageCapForm from '@renderer/form/incapacite_perma/menage_cap'

const IPMC = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_perma_menage_cap: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <IPMenageCapForm onSubmit={saveData} initialValues={data?.incapacite_perma_menage_cap} />
      </div>
    </div>
  )
}

export default IPMC
