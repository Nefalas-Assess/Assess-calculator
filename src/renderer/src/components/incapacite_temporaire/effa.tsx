import EffortAccruForm from '@renderer/form/incapacite_temp/effort_accru'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback } from 'react'

const EFFA = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ efforts_accrus: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <EffortAccruForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.efforts_accrus}
          />
          <TotalBox label="incapacite_temp.effa.total" />
          <TotalBoxInterest />
        </div>
      </MoneyScope>
    </div>
  )
}

export default EFFA
