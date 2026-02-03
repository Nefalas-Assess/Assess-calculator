export default (data: any) => {
  // Renommer le champ pourcentage en percentage
  if (data?.efforts_accrus?.efforts?.length > 0) {
    data.efforts_accrus.efforts.forEach((effort) => {
      if (effort?.pourcentage) {
        effort.percentage = effort.pourcentage
        delete effort.pourcentage
      }
    })
  }

  return data
}
