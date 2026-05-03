import FraisFunForm from '@renderer/form/deces/frais'
import TotalBox from '@renderer/generic/totalBox'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import { useCallback, useRef } from 'react'

const FraisFun = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()
  const ref = useRef(null)

  const saveData = useCallback(
    (values) => {
      setData({ frais_funeraire: values })
    },
    [setData]
  )

  return (
    <div id="content">
      <div id="main" ref={ref}>
        <FraisFunForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.frais_funeraire}
        />
        <TotalBox label="deces.frais.total" documentRef={ref} />
      </div>
    </div>
  )
}

export default FraisFun
