import React, { useCallback, useContext, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import TextItem from '@renderer/generic/textItem'
import PrejudiceScolaireForm from '@renderer/form/prejudice_scolaire'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

const PrejudiceScolaire = ({ editable }) => {
  const { setData, data } = useContext(AppContext)

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ prejudice_scolaire: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <TextItem path="nav.prejudice_scolaire" tag="h1" />
        <PrejudiceScolaireForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.prejudice_scolaire}
        />
        <TotalBox label="prejudice_scolaire.total" documentRef={ref} />
        <TotalBoxInterest documentRef={ref} />
      </div>
    </div>
  )
}

export default PrejudiceScolaire
