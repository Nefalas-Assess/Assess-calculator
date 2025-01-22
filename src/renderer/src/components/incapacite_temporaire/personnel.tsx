import React, { useCallback, useContext, useRef, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import ITPersonnelForm from '@renderer/form/incapacite_temp/personnel'
import TotalBox from '@renderer/generic/totalBox'

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
        <TotalBox label="Total général :" documentRef={ref} />
        <TotalBox label="Total intérêts :" name="interest" documentRef={ref} />
      </div>
    </div>
  )
}

export default Personnel
