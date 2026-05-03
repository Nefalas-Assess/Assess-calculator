import HospitalisationForm from '@renderer/form/incapacite_temp/hospitalisation'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback, useRef } from 'react'

const Hospitalisation = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ hospitalisation: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <HospitalisationForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.hospitalisation}
        />
        <TotalBox label="incapacite_temp.hospitalisation.total" documentRef={ref} />
        <TotalBoxInterest documentRef={ref} />
      </div>
    </div>
  )
}

export default Hospitalisation
