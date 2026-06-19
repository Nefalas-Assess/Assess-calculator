import { getDamageMatVehicleConfigDefaults } from '@renderer/data/damage_mat'

export default (data: any) => {
  if (!data?.general_info) {
    return data
  }

  data.general_info.config = {
    ...getDamageMatVehicleConfigDefaults(),
    ...(data.general_info.config || {})
  }

  return data
}
