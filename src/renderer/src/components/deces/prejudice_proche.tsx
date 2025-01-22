import PrejudiceProcheForm from '@renderer/form/deces/prejudice_proche'
import Money from '@renderer/generic/money'
import TotalBox from '@renderer/generic/totalBox'
import { AppContext } from '@renderer/providers/AppProvider'
import React, { useCallback, useContext, useRef, useState } from 'react'

const PrejudiceProche = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ prejudice_proche: values })
    },
    [setData]
  )
  return (
    <div id="content">
      <div id="main" ref={ref}>
        <PrejudiceProcheForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.prejudice_proche}
        />
        <TotalBox label="Total général :" documentRef={ref} />
      </div>
    </div>
  )
}

export default PrejudiceProche
