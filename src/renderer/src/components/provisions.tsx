import React, { useCallback, useContext, useRef, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import ProvisionsForm from '@renderer/form/provisions_form'
import TotalBox from '@renderer/generic/totalBox'

export const Provisions = () => {
  const { setData, data } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ provisions: values })
    },
    [setData]
  )

  return (
    <div id="content" ref={ref}>
      <ProvisionsForm onSubmit={saveData} initialValues={data?.provisions} />
      <TotalBox label={'Total des intérêts :'} negative name="interest" documentRef={ref} />
    </div>
  )
}

export default Provisions
