import PrejudiceProcheForm from '@renderer/form/deces/prejudice_proche'
import { MoneyScope } from '@renderer/generic/moneyScope'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback } from 'react'

const PrejudiceProche = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ prejudice_proche: values })
    },
    [setData]
  )
  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <PrejudiceProcheForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.prejudice_proche}
          />
        </div>
      </MoneyScope>
    </div>
  )
}

export default PrejudiceProche
