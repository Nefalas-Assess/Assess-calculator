import HospitalisationForm from '@renderer/form/incapacite_temp/hospitalisation'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useRef } from 'react'

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
        <TotalBox label="incapacite_temp.hospitalisation.total" documentRef={ref} />
        <TotalBoxInterest documentRef={ref} />
      </div>
    </div>
  )
}

export default Hospitalisation
