import EffortAccruForm from '@renderer/form/effort_accru'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useState } from 'react'

const EFFA = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ efforts_accrus: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <EffortAccruForm onSubmit={saveData} initialValues={data?.efforts_accrus} />
      </div>
    </div>
  )
}

export default EFFA