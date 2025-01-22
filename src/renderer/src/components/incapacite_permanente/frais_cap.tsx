import FraisCapForm from '@renderer/form/incapacite_perma/frais_cap'
import Money from '@renderer/generic/money'
import TotalBox from '@renderer/generic/totalBox'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useRef, useState } from 'react'

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
        <TotalBox label="Total général :" documentRef={ref} />
      </div>
    </div>
  )
}

export default FraisCap
