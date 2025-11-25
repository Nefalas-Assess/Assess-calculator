export const validateData = (data) => {
  const errors = {}

  const date_accident = data?.general_info?.date_accident
  if (date_accident) {
    if (data?.incapacite_temp_personnel?.periods?.length > 0) {
      for (let i = 0; i < data?.incapacite_temp_personnel?.periods?.length; i++) {
        const period = data?.incapacite_temp_personnel?.periods[i]
        if (period?.start < date_accident) {
          errors[`incapacite_temp_personnel.periods.${i}.start`] = 'errors.before_date_accident'
        }
      }
    }

    if (data?.incapacite_temp_economique?.brut?.length > 0) {
      for (let i = 0; i < data?.incapacite_temp_economique?.brut?.length; i++) {
        const period = data?.incapacite_temp_economique?.brut[i]
        if (period?.start < date_accident) {
          errors[`incapacite_temp_economique.brut.${i}.start`] = 'errors.before_date_accident'
        }
      }
    }

    if (data?.incapacite_temp_economique?.net?.length > 0) {
      for (let i = 0; i < data?.incapacite_temp_economique?.net?.length; i++) {
        const period = data?.incapacite_temp_economique?.net[i]
        if (period?.start < date_accident) {
          errors[`incapacite_temp_economique.net.${i}.start`] = 'errors.before_date_accident'
        }
      }
    }

    if (data?.efforts_accrus?.efforts?.length > 0) {
      for (let i = 0; i < data?.efforts_accrus?.efforts?.length; i++) {
        const period = data?.efforts_accrus?.efforts[i]
        if (period?.start < date_accident) {
          errors[`efforts_accrus.efforts.${i}.start`] = 'errors.before_date_accident'
        }
      }
    }

    if (data?.hospitalisation?.periods?.length > 0) {
      for (let i = 0; i < data?.hospitalisation?.periods?.length; i++) {
        const period = data?.hospitalisation?.periods[i]
        if (period?.start < date_accident) {
          errors[`hospitalisation.periods.${i}.start`] = 'errors.before_date_accident'
        }
      }
    }

    if (data?.incapacite_temp_menagere?.periods?.length > 0) {
      for (let i = 0; i < data?.incapacite_temp_menagere?.periods?.length; i++) {
        const period = data?.incapacite_temp_menagere?.periods[i]
        if (period?.start < date_accident) {
          errors[`incapacite_temp_menagere.periods.${i}.start`] = 'errors.before_date_accident'
        }
      }
    }

    if (data?.pretium_doloris?.periods?.length > 0) {
      for (let i = 0; i < data?.pretium_doloris?.periods?.length; i++) {
        const period = data?.pretium_doloris?.periods[i]
        if (period?.start < date_accident) {
          errors[`pretium_doloris.periods.${i}.start`] = 'errors.before_date_accident'
        }
      }
    }
  }

  if (data?.provisions?.provisions?.length > 0) {
    for (let i = 0; i < data?.provisions?.provisions?.length; i++) {
      const provision = data?.provisions?.provisions[i]
      if (provision?.amount > 0) {
        errors[`provisions.provisions.${i}.amount`] = 'errors.amount_must_be_negative'
      }
    }
  }

  return errors
}
