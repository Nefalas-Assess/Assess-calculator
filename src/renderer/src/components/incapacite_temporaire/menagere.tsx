import { useCallback } from 'react'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import ITMenagereForm from '@renderer/form/incapacite_temp/menagère'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

const Menagere = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_temp_menagere: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <ITMenagereForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.incapacite_temp_menagere}
          />
          <TotalBox label="incapacite_temp.menagere.total" />
          <TotalBoxInterest />
        </div>
      </MoneyScope>
    </div>
  )
}

export default Menagere
