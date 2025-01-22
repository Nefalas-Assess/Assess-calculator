import EffortAccruForm from '@renderer/form/incapacite_temp/effort_accru'
import TotalBox from '@renderer/generic/totalBox'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useRef, useState } from 'react'

const EFFA = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ efforts_accrus: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <EffortAccruForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.efforts_accrus}
        />
        <TotalBox label="Total général :" documentRef={ref} />
        <TotalBox label="Total intérêts :" name="interest" documentRef={ref} />
      </div>
    </div>
  )
}

export default EFFA
