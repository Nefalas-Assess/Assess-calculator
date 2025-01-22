import React, { useCallback, useContext, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import ITEconomiqueForm from '@renderer/form/incapacite_temp/economique'
import TotalBox from '@renderer/generic/totalBox'

const Economique = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_temp_economique: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <ITEconomiqueForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.incapacite_temp_economique}
        />
        <TotalBox label="Total général :" documentRef={ref} />
        <TotalBox label="Total intérêts :" name="interest" documentRef={ref} />
      </div>
    </div>
  )
}

export default Economique
