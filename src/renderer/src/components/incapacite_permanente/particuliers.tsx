import React, { useCallback, useContext, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import PrejudiceParticuliersForm from '@renderer/form/incapacite_perma/prejudice_particulier'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

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
        <TotalBox label={'incapacite_perma.particulier.total'} documentRef={ref} />
        <TotalBoxInterest documentRef={ref} />
      </div>
    </div>
  )
}

export default Particuliers
