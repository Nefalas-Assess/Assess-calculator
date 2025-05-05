import React, { useCallback, useContext, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import ITEconomiqueForm from '@renderer/form/incapacite_temp/economique'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

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
        <TotalBox label="incapacite_temp.economique.total" documentRef={ref} />
        <TotalBoxInterest documentRef={ref} />
      </div>
    </div>
  )
}

export default Economique
