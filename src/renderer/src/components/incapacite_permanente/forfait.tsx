import { useCallback } from 'react'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import ForfaitForm from '@renderer/form/incapacite_perma/forfait'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

const Forfait = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ forfait_ip: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <ForfaitForm onSubmit={saveData} editable={editable} initialValues={data?.forfait_ip} />
          <TotalBox label={'incapacite_perma.forfait.total'} />
          <TotalBoxInterest />
        </div>
      </MoneyScope>
    </div>
  )
}

export default Forfait
