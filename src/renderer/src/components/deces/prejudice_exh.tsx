import PrejudiceEXHForm from '@renderer/form/deces/prejudice_exh'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback } from 'react'

const PrejudiceEXH = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ prejudice_exh: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <PrejudiceEXHForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.prejudice_exh}
          />
          <TotalBox label="deces.prejudice_exh.total" />
        </div>
      </MoneyScope>
    </div>
  )
}

export default PrejudiceEXH
