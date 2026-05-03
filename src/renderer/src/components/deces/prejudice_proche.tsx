import PrejudiceProcheForm from '@renderer/form/deces/prejudice_proche'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback, useRef } from 'react'

const PrejudiceProche = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

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
      </div>
    </div>
  )
}

export default PrejudiceProche
