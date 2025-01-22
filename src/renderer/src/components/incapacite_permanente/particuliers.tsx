import React, { useCallback, useContext, useRef, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import PrejudiceParticuliersForm from '@renderer/form/incapacite_perma/prejudice_particulier'
import TotalBox from '@renderer/generic/totalBox'

const Particuliers = ({ editable }) => {
  const { data, setData } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ prejudice_particulier: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <PrejudiceParticuliersForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.prejudice_particulier}
        />
        <TotalBox label="Total général :" documentRef={ref} />
        <TotalBox label="Total intérêts :" name="interest" documentRef={ref} />
      </div>
    </div>
  )
}

export default Particuliers
