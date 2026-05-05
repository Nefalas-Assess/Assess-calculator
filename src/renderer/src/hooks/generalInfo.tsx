import { useAppData } from '@renderer/providers/AppProvider'

export const useGeneralInfo = () => {
  const data = useAppData()

  return data?.general_info || {}
}

export default useGeneralInfo
