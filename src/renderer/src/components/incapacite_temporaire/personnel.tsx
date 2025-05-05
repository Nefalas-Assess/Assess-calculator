import React, { useCallback, useContext, useRef, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import ITPersonnelForm from '@renderer/form/incapacite_temp/personnel'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

const Personnel = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_temp_personnel: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <ITPersonnelForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.incapacite_temp_personnel}
        />
        <TotalBox label="incapacite_temp.personnel.total" documentRef={ref} />
        <TotalBoxInterest documentRef={ref} />
      </div>
    </div>
  )
}

export default Personnel
