import React, { useCallback, useContext, useRef, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import FraisForm from '@renderer/form/frais_form'
import TotalBox from '@renderer/generic/totalBox'

const Frais = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ frais: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <FraisForm onSubmit={saveData} editable={editable} initialValues={data?.frais} />
        <TotalBox label="Total général :" documentRef={ref} />
        <TotalBox label="Total intérêts :" name="interest" documentRef={ref} />
      </div>
    </div>
  )
}

export default Frais
