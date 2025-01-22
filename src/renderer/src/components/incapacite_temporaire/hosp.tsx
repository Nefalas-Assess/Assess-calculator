import HospitalisationForm from '@renderer/form/incapacite_temp/hospitalisation'
import TotalBox from '@renderer/generic/totalBox'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useRef, useState } from 'react'

const Hospitalisation = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ hospitalisation: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <HospitalisationForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.hospitalisation}
        />
        <TotalBox label="Total général :" documentRef={ref} />
        <TotalBox label="Total intérêts :" name="interest" documentRef={ref} />
      </div>
    </div>
  )
}

export default Hospitalisation
