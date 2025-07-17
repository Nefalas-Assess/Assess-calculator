export const validateData = (data) => {
  const errors = {}

  const date_accident = data?.general_info?.date_accident;
  if(date_accident) {
    if(data?.incapacite_temp_personnel?.periods?.length > 0) {
      for(let i = 0; i < data?.incapacite_temp_personnel?.periods?.length; i++) {
        const period = data?.incapacite_temp_personnel?.periods[i]
        if(period?.start < date_accident) {
          errors[`incapacite_temp_personnel.periods.${i}.start`] = "errors.before_date_accident"
        }
      }
    }
  }

  if(data?.provisions?.provisions?.length > 0) {
    for(let i = 0; i < data?.provisions?.provisions?.length; i++) {
      const provision = data?.provisions?.provisions[i];
      if(provision?.amount > 0) {
        errors[`provisions.provisions.${i}.amount`] = "errors.amount_must_be_negative"
      }
    }
  }

  return errors
}