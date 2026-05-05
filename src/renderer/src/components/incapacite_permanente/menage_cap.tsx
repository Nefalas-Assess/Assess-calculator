import { useCallback } from 'react'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import IPMenageCapForm from '@renderer/form/incapacite_perma/menage_cap'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

const MenageCap = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_perma_menage_cap: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <IPMenageCapForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.incapacite_perma_menage_cap}
          />
          <TotalBox label="incapacite_perma.menage.total" />
          <TotalBoxInterest />
        </div>
      </MoneyScope>
    </div>
  )
}

export default MenageCap
