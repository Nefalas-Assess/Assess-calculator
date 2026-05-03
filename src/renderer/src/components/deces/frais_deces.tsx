import FraisFunForm from '@renderer/form/deces/frais'
import TotalBox from '@renderer/generic/totalBox'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback } from 'react'
import { MoneyScope } from '@renderer/generic/moneyScope'

const FraisFun = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()
  const saveData = useCallback(
    (values) => {
      setData({ frais_funeraire: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <FraisFunForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.frais_funeraire}
          />
          <TotalBox label="deces.frais.total" />
        </div>
      </MoneyScope>
    </div>
  )
}

export default FraisFun
