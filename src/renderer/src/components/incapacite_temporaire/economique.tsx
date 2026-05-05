import { useCallback } from 'react'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import ITEconomiqueForm from '@renderer/form/incapacite_temp/economique'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

const Economique = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_temp_economique: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <ITEconomiqueForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.incapacite_temp_economique}
          />
          <TotalBox label="incapacite_temp.economique.total" />
          <TotalBoxInterest />
        </div>
      </MoneyScope>
    </div>
  )
}

export default Economique
