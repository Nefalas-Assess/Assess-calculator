import { useCallback, useRef } from 'react'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import ProvisionsForm from '@renderer/form/provisions_form'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

export const Provisions = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()

  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ provisions: values })
    },
    [setData]
  )

  return (
    <div id="content" ref={ref}>
      <ProvisionsForm onSubmit={saveData} editable={editable} initialValues={data?.provisions} />
      <TotalBoxInterest documentRef={ref} />
    </div>
  )
}

export default Provisions
