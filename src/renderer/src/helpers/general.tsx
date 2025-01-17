import { addDays, differenceInDays } from 'date-fns'

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

export const getDays = (item = {}, varName) => {
  let { start, end } = item

  if ((!start || !end) && varName) {
    start = item?.[varName?.[0]]
    end = item?.[varName?.[1]]
  }

  if (start && end) {
    const debutDate = new Date(start)
    const finDate = new Date(end)

    // Vérification des dates valides
    if (!isNaN(debutDate) && !isNaN(finDate)) {
      // Calcul du nombre de jours entre les deux dates en tenant compte de la date de début et de fin
      const timeDiff = finDate.getTime() - debutDate.getTime() // En millisecondes
      const jours = Math.max(0, timeDiff / (1000 * 3600 * 24) + 1) // Conversion en jours
      return jours
    }
  }
}

export const getMedDate = (item, varName) => {
  let { start, end } = item

  if ((!start || !end) && varName) {
    start = item?.[varName?.[0]]
    end = item?.[varName?.[1]]
  }

  const diffInDays = differenceInDays(end, start)

  return addDays(start, diffInDays / 2)
}
