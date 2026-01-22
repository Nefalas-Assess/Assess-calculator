import React, { useCallback, useContext } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import TextItem from '@renderer/generic/textItem'
import PrejudiceScolaireForm from '@renderer/form/prejudice_scolaire'

const PrejudiceScolaire = ({ editable }) => {
  const { setData, data } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ prejudice_scolaire: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <TextItem path="nav.prejudice_scolaire" tag="h1" />
        <PrejudiceScolaireForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.prejudice_scolaire}
        />
      </div>
    </div>
  )
}

export default PrejudiceScolaire
