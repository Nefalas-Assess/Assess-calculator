export default (data: any) => {
  if(!data?.general_info?.ip) {
    data.general_info.ip = {
      menagere: {method: "forfait"},
      personnel: {method: "forfait"},
      economique: {method: "forfait"}
    }
  } else {
    data.general_info.ip.menagere.method = "forfait"
    data.general_info.ip.personnel.method = "forfait"
    data.general_info.ip.economique.method = "forfait"
  }
  
  if (data.incapacite_perma_menage_cap?.perso_pourcentage) {
    data.general_info.ip.menagere.method = "capitalized"
    data.general_info.ip.menagere.interet = data.incapacite_perma_menage_cap.perso_pourcentage

    delete data.incapacite_perma_menage_cap.perso_pourcentage
    delete data.incapacite_perma_menage_cap.conso_pourcentage
  }
  if (data.incapacite_perma_personnel_cap?.conso_pourcentage) {
    data.general_info.ip.personnel.method = "capitalized"
    data.general_info.ip.personnel.interet = data.incapacite_perma_personnel_cap.perso_pourcentage

    delete data.incapacite_perma_personnel_cap.perso_pourcentage
    delete data.incapacite_perma_personnel_cap.conso_pourcentage
  
  }
  if(data.incapacite_perma_economique_cap?.brut?.conso_pourcentage || data.incapacite_perma_economique_cap?.net?.conso_pourcentage) {
    data.general_info.ip.economique.method = "capitalized"
    data.general_info.ip.economique.interet = data.incapacite_perma_economique_cap?.brut?.conso_pourcentage || data.incapacite_perma_economique_cap?.net?.conso_pourcentage
    
    delete data.incapacite_perma_economique_cap.brut.conso_pourcentage
    delete data.incapacite_perma_economique_cap.net.conso_pourcentage
    delete data.incapacite_perma_economique_cap.brut.pourcentage
    delete data.incapacite_perma_economique_cap.net.pourcentage
  }

  return data
}