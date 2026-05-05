import { useCallback } from 'react'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import PrejudiceParticuliersForm from '@renderer/form/incapacite_perma/prejudice_particulier'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

const Particuliers = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ prejudice_particulier: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <PrejudiceParticuliersForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.prejudice_particulier}
          />
          <TotalBox label={'incapacite_perma.particulier.total'} />
          <TotalBoxInterest />
        </div>
      </MoneyScope>
    </div>
  )
}

export default Particuliers
