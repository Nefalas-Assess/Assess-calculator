import IPEcoCapForm from '@renderer/form/incapacite_perma/economique_cap'
import Money from '@renderer/generic/money'
import TotalBox from '@renderer/generic/totalBox'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useState } from 'react'

const EconomiqueCap = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_perma_economique_cap: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <IPEcoCapForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.incapacite_perma_economique_cap}
        />
        <TotalBox label="Total général :" />
        <TotalBox label="Total intérêts :" name="interest" />
      </div>
    </div>
  )
}

export default EconomiqueCap
