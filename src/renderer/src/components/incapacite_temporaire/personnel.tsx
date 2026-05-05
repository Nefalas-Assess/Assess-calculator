import { useCallback } from 'react'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import ITPersonnelForm from '@renderer/form/incapacite_temp/personnel'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

const Personnel = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_temp_personnel: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <ITPersonnelForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.incapacite_temp_personnel}
          />
          <TotalBox label="incapacite_temp.personnel.total" />
          <TotalBoxInterest />
        </div>
      </MoneyScope>
    </div>
  )
}

export default Personnel
