import { useContext } from 'react'
import TotalBox from './totalBox'
import { AppContext } from '@renderer/providers/AppProvider'

export const TotalBoxInterest = (props) => {
  const { data } = useContext(AppContext)

  if (data?.general_info?.calcul_interets !== 'true') return

  return <TotalBox label="common.total_interets" name="interest" {...props} />
}

export default TotalBoxInterest
