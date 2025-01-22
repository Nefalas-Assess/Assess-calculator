import React, { useCallback, useContext, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import ITMenagereForm from '@renderer/form/incapacite_temp/menagère'
import TotalBox from '@renderer/generic/totalBox'

const Menagere = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_temp_menagere: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <ITMenagereForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.incapacite_temp_menagere}
        />
        <TotalBox label="Total général :" documentRef={ref} />
        <TotalBox label="Total intérêts :" name="interest" documentRef={ref} />
      </div>
    </div>
  )
}

export default Menagere
