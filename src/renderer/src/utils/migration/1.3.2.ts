export default (data: any) => {
  if (!data?.prejudice_particulier) {
    return data
  }

  if (data.prejudice_particulier.quantum_doloris_enabled === undefined) {
    data.prejudice_particulier.quantum_doloris_enabled = true
  }
  if (data.prejudice_particulier.prejudice_esthetique_enabled === undefined) {
    data.prejudice_particulier.prejudice_esthetique_enabled = true
  }
  if (data.prejudice_particulier.prejudice_sexuels_enabled === undefined) {
    data.prejudice_particulier.prejudice_sexuels_enabled = true
  }
  if (data.prejudice_particulier.prejudice_agrements_enabled === undefined) {
    data.prejudice_particulier.prejudice_agrements_enabled = true
  }

  if (data?.prejudice_scolaire?.moral_damage) {
    data.prejudice_scolaire.moral_damage_amount = 3000
  }

  return data
}
