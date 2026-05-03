import PretiumDolorisForm from '@renderer/form/incapacite_temp/pretium_doloris'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback, useRef } from 'react'

const PretiumDoloris = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ pretium_doloris: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <PretiumDolorisForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.pretium_doloris}
        />
        <TotalBox label="incapacite_temp.pretium.total" documentRef={ref} />
        <TotalBoxInterest documentRef={ref} />
      </div>
    </div>
  )
}

export default PretiumDoloris
