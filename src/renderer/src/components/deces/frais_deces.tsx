import FraisFunForm from '@renderer/form/deces/frais'
import Money from '@renderer/generic/money'
import TotalBox from '@renderer/generic/totalBox'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useRef, useState } from 'react'

const FraisFun = ({ editable }) => {
  const { data, setData } = useContext(AppContext)
  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ frais_funeraire: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <FraisFunForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.frais_funeraire}
        />
        <TotalBox label="Total général :" documentRef={ref} />
      </div>
    </div>
  )
}

export default FraisFun
