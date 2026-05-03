import PretiumDolorisForm from '@renderer/form/incapacite_temp/pretium_doloris'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback } from 'react'

const PretiumDoloris = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ pretium_doloris: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <PretiumDolorisForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.pretium_doloris}
          />
          <TotalBox label="incapacite_temp.pretium.total" />
          <TotalBoxInterest />
        </div>
      </MoneyScope>
    </div>
  )
}

export default PretiumDoloris
