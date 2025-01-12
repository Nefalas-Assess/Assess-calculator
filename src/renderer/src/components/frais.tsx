import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import FraisForm from '@renderer/form/frais_form'

const ITP = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ frais: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <FraisForm onSubmit={saveData} initialValues={data?.frais} />
      </div>
    </div>
  )
}

export default ITP
