import FraisFunForm from '@renderer/form/deces/frais'
import Money from '@renderer/generic/money'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useState } from 'react'

const FraisFun = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ frais_funeraire: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <FraisFunForm onSubmit={saveData} initialValues={data?.frais_funeraire} />
      </div>
    </div>
  )
}

export default FraisFun
