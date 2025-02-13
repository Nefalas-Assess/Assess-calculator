import IPPersonnelCapForm from '@renderer/form/incapacite_perma/personnel_cap'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useRef, useState } from 'react'

const PersonnelCap = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_perma_personnel_cap: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <IPPersonnelCapForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.incapacite_perma_personnel_cap}
        />
        <TotalBox label="Total général :" documentRef={ref} />
        <TotalBoxInterest documentRef={ref} />
      </div>
    </div>
  )
}

export default PersonnelCap
