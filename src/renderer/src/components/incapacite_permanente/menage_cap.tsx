import React, { useCallback, useContext, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import IPMenageCapForm from '@renderer/form/incapacite_perma/menage_cap'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

const MenageCap = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_perma_menage_cap: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <IPMenageCapForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.incapacite_perma_menage_cap}
        />
        <TotalBox label="incapacite_perma.menage.total" documentRef={ref} />
        <TotalBoxInterest documentRef={ref} />
      </div>
    </div>
  )
}

export default MenageCap
