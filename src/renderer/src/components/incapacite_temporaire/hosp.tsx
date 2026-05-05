import HospitalisationForm from '@renderer/form/incapacite_temp/hospitalisation'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback } from 'react'

const Hospitalisation = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ hospitalisation: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <HospitalisationForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.hospitalisation}
          />
          <TotalBox label="incapacite_temp.hospitalisation.total" />
          <TotalBoxInterest />
        </div>
      </MoneyScope>
    </div>
  )
}

export default Hospitalisation
