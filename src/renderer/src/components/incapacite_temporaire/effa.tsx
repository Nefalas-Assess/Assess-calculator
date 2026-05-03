import EffortAccruForm from '@renderer/form/incapacite_temp/effort_accru'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback, useRef } from 'react'

const EFFA = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ efforts_accrus: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <EffortAccruForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.efforts_accrus}
        />
        <TotalBox label="incapacite_temp.effa.total" documentRef={ref} />
        <TotalBoxInterest documentRef={ref} />
      </div>
    </div>
  )
}

export default EFFA
