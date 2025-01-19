import FraisCapForm from '@renderer/form/incapacite_perma/frais_cap'
import Money from '@renderer/generic/money'
import TotalBox from '@renderer/generic/totalBox'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useState } from 'react'

const FraisCap = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_perma_charges: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <FraisCapForm onSubmit={saveData} initialValues={data?.incapacite_perma_charges} />
        <TotalBox label="Total général :" />
      </div>
    </div>
  )
}

export default FraisCap
