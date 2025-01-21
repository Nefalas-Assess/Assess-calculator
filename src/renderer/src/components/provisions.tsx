import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import ProvisionsForm from '@renderer/form/provisions_form'

export const Provisions = () => {
  const { setData, data } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ provisions: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <ProvisionsForm onSubmit={saveData} initialValues={data?.provisions} />
    </div>
  )
}

export default Provisions
