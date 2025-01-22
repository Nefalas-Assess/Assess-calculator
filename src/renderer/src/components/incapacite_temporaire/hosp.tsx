import HospitalisationForm from '@renderer/form/incapacite_temp/hospitalisation'
import TotalBox from '@renderer/generic/totalBox'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useState } from 'react'

const Hospitalisation = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ hospitalisation: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <HospitalisationForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.hospitalisation}
        />
        <TotalBox label="Total général :" />
        <TotalBox label="Total intérêts :" name="interest" />
      </div>
    </div>
  )
}

export default Hospitalisation
