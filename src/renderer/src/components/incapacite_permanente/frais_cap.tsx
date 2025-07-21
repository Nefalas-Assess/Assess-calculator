import FraisCapForm from '@renderer/form/incapacite_perma/frais_cap'
import TotalBox from '@renderer/generic/totalBox'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useRef } from 'react'

const FraisCap = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_perma_charges: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <FraisCapForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.incapacite_perma_charges}
        />
        <TotalBox label={'incapacite_perma.frais_cap.total'} documentRef={ref} />
      </div>
    </div>
  )
}

export default FraisCap
