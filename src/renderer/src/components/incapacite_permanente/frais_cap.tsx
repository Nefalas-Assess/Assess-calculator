import FraisCapForm from '@renderer/form/incapacite_perma/frais_cap'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback } from 'react'

const FraisCap = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ incapacite_perma_charges: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <FraisCapForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.incapacite_perma_charges}
          />
          <TotalBox label={'incapacite_perma.frais_cap.total'} />
        </div>
      </MoneyScope>
    </div>
  )
}

export default FraisCap
