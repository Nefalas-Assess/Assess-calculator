import PrejudiceEXHForm from '@renderer/form/deces/prejudice_exh'
import Money from '@renderer/generic/money'
import TotalBox from '@renderer/generic/totalBox'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useRef, useState } from 'react'

const PrejudiceEXH = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ prejudice_exh: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <PrejudiceEXHForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.prejudice_exh}
        />
        <TotalBox label="deces.prejudice_exh.total" documentRef={ref} />
      </div>
    </div>
  )
}

export default PrejudiceEXH
