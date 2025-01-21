import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import Money from '@renderer/generic/money'
import IPMenageCapForm from '@renderer/form/incapacite_perma/menage_cap'
import TotalBox from '@renderer/generic/totalBox'

const MenageCap = ({ editable }) => {
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
        <IPMenageCapForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.incapacite_perma_menage_cap}
        />
        <TotalBox label="Total général :" />
        <TotalBox label="Total intérêts :" name="interest" />
      </div>
    </div>
  )
}

export default MenageCap
