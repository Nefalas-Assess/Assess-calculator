import { useCallback } from 'react'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import TextItem from '@renderer/generic/textItem'
import PrejudiceScolaireForm from '@renderer/form/prejudice_scolaire'
import { MoneyScope } from '@renderer/generic/moneyScope'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

const PrejudiceScolaire = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const saveData = useCallback(
    (values) => {
      setData({ prejudice_scolaire: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <MoneyScope>
        <div id="main">
          <TextItem path="nav.prejudice_scolaire" tag="h1" />
          <PrejudiceScolaireForm
            onSubmit={saveData}
            editable={editable}
            initialValues={data?.prejudice_scolaire}
          />
          <TotalBox label="prejudice_scolaire.total" />
          <TotalBoxInterest />
        </div>
      </MoneyScope>
    </div>
  )
}

export default PrejudiceScolaire
