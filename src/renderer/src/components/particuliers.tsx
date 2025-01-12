import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import PrejudiceParticuliersForm from '@renderer/form/prejudice_particulier_form'

const ITP = () => {
  const { data, setData } = useContext(AppContext)

  const saveData = useCallback(
    (values) => {
      setData({ prejudice_particulier: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main">
        <PrejudiceParticuliersForm
          onSubmit={saveData}
          initialValues={data?.prejudice_particulier}
        />
      </div>
    </div>
  )
}

export default ITP
