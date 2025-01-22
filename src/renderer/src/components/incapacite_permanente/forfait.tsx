import React, { useCallback, useContext, useRef, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import ForfaitForm from '@renderer/form/incapacite_perma/forfait'
import TotalBox from '@renderer/generic/totalBox'

const Forfait = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ forfait_ip: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <ForfaitForm onSubmit={saveData} editable={editable} initialValues={data?.forfait_ip} />
        <TotalBox label="Total général :" documentRef={ref} />
        <TotalBox label="Total intérêts :" name="interest" documentRef={ref} />
      </div>
    </div>
  )
}

export default Forfait
