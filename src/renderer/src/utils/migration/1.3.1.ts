export default (data: any) => {
  if (data?.incapacite_perma_economique_cap && !data.incapacite_perma_economique_cap.salary_basis) {
    data.incapacite_perma_economique_cap.salary_basis = 'brut'
  }

  return data
}
