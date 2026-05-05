import IPPersonnelCapForm from '@renderer/form/incapacite_perma/personnel_cap'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback } from 'react'

const PersonnelCap = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_perma_personnel_cap: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <IPPersonnelCapForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.incapacite_perma_personnel_cap}
          />
          <TotalBox label="incapacite_perma.personnel.total" />
          <TotalBoxInterest />
        </div>
      </MoneyScope>
    </div>
  )
}

export default PersonnelCap
