import { useCallback } from 'react'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import DamageMatForm, { computeDamageMatTotal } from '@renderer/form/damage_mat'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import { MoneyScope } from '@renderer/generic/moneyScope'
import useGeneralInfo from '@renderer/hooks/generalInfo'

const DamageMat = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()
  const generalInfo = useGeneralInfo()
  const total = computeDamageMatTotal(data?.damage_mat, generalInfo?.config)

  const saveData = useCallback(
    (values) => {
      setData({ damage_mat: values })
    },
    [setData]
  )

  if (editable === false && total === 0) return null

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <DamageMatForm onSubmit={saveData} editable={editable} initialValues={data?.damage_mat} />
          <TotalBox label="damage_mat.total" />
          <TotalBoxInterest />
        </div>
      </MoneyScope>
    </div>
  )
}

export default DamageMat
