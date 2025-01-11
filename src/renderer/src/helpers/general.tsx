export const getChildrenUnder25 = (children) => {
  const now = new Date()
  return children?.filter((child) => {
    if (child?.birthDate) {
      const birthDate = new Date(child.birthDate) // Convertir la date de naissance en objet Date
      const age = now.getFullYear() - birthDate.getFullYear()

      // Ajuster l'âge en fonction du mois et du jour
      const isBirthdayPassedThisYear =
        now.getMonth() > birthDate.getMonth() ||
        (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate())
      const adjustedAge = isBirthdayPassedThisYear ? age : age - 1

      return adjustedAge < 25 // Garder les enfants de moins de 25 ans
    }
    return false
  }).length // Retourner le nombre d'enfants filtrés
}

export const findClosestIndex = (keys, value) => {
  // Convertir les clés en nombres
  const numericKeys = keys.map(Number)

  for (let i = 0; i < numericKeys.length; i++) {
    // Si la valeur est inférieure ou égale à la clé actuelle
    if (value <= numericKeys[i]) {
      return i
    }
  }

  // Si la valeur est supérieure à toutes les clés, retourne le dernier index
  return numericKeys.length - 1
}
