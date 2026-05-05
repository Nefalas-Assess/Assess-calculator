import TotalBox from './totalBox'
import { useAppData } from '@renderer/providers/AppProvider'

export const TotalBoxInterest = (props) => {
  const data = useAppData()

  if (data?.general_info?.calcul_interets !== 'true') return

  return <TotalBox label="common.total_interets" name="interest" {...props} />
}

export default TotalBoxInterest
