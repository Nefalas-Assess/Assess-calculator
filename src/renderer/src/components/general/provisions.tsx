import { useCallback } from 'react'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import ProvisionsForm from '@renderer/form/provisions_form'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import { MoneyScope } from '@renderer/generic/moneyScope'

export const Provisions = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ provisions: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <ProvisionsForm onSubmit={saveData} editable={editable} initialValues={data?.provisions} />
        <TotalBoxInterest />
      </MoneyScope>
    </div>
  )
}

export default Provisions
