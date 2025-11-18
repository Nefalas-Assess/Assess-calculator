export default (data: any) => {
  if (data?.prejudice_particulier?.coefficient_quantum_doloris) {
    data.prejudice_particulier.coefficient_quantum_doloris =
      parseInt(data.prejudice_particulier.coefficient_quantum_doloris) + 1
  }
  if (data?.prejudice_particulier?.coefficient_prejudice_esthétique) {
    data.prejudice_particulier.coefficient_prejudice_esthétique =
      parseInt(data.prejudice_particulier.coefficient_prejudice_esthétique) + 1
  }

  return data
}
