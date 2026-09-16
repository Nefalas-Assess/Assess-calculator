export default (data: any) => {
  if (!data?.general_info) {
    return data
  }

  if (data?.general_info?.config?.date_paiement) {
    if (data?.frais && !data?.frais?.administratif_date_paiement) {
      data.frais.administratif_date_paiement = data.general_info.config.date_paiement
    }
    if (data?.frais && !data?.frais?.vestimentaire_date_paiement) {
      data.frais.vestimentaire_date_paiement = data.general_info.config.date_paiement
    }
    if (data?.frais && !data?.frais?.deplacement_date_paiement) {
      data.frais.deplacement_date_paiement = data.general_info.config.date_paiement
    }
  }

  if (data?.frais?.package_value) {
    data.frais.package = [
      {
        amount: data.frais.package_value
      }
    ]
    delete data.frais.package_value
  }

  return data
}
