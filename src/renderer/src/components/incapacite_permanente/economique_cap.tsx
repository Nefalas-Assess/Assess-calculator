import IPEcoCapForm from '@renderer/form/incapacite_perma/economique_cap'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback } from 'react'

const EconomiqueCap = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_perma_economique_cap: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <IPEcoCapForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.incapacite_perma_economique_cap}
          />
          <TotalBox label={'incapacite_perma.eco_cap.total'} />
          <TotalBoxInterest />
        </div>
      </MoneyScope>
    </div>
  )
}

export default EconomiqueCap
