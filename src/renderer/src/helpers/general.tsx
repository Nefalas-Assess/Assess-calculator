import { addDays, differenceInDays, isSameDay } from 'date-fns'

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
// Calculate the number of days before and after 25 years old for a given period
export const calculateDaysBeforeAfter25 = (birthDate, dates) => {
  const parseDate = (date) => new Date(date)

  // Convertir les dates en objets Date
  const birth = parseDate(birthDate)
  const start = parseDate(dates?.[0])
  const end = parseDate(dates?.[1])

  // if (isSameDay(start, end)) {
  //   end = addDays(start, 1)
  // }

  // Vérification des dates
  if (start > end) {
    return 'La date de début doit être avant la date de fin.'
  }

  // Calcul de la date des 25 ans
  const twentyFifthBirthday = new Date(birth.getFullYear() + 25, birth.getMonth(), birth.getDate())

  // Calcul des jours entre deux dates
  const calculateDaysBetween = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // Convertir les millisecondes en jours
  }

  let before25 = 0
  let after25 = 0

  // Cas où la date de début est avant les 25 ans
  if (start <= twentyFifthBirthday) {
    // Calcul des jours avant les 25 ans
    const actualEndBefore25 = end <= twentyFifthBirthday ? end : twentyFifthBirthday

    before25 = calculateDaysBetween(start, actualEndBefore25)

    // Calcul des jours après les 25 ans
    if (end > twentyFifthBirthday) {
      after25 = calculateDaysBetween(twentyFifthBirthday, end)
    }

    // Cas où la date de naissance est après la date de début
    if (birth > start) {
      // Si il n'est pas née pendant la période
      if (birth > end) {
        before25 = 0
        after25 = 0
      }
      // Si il est née durant la période
      else {
        before25 = calculateDaysBetween(birth, end)
      }
    }
  } else {
    // Cas où la date de début est après les 25 ans
    after25 = calculateDaysBetween(start, end)
  }

  const total = calculateDaysBetween(start, end)

  const percentageBefore25 = total > 0 ? before25 / total : 0

  return {
    percentageBefore25,
    before25,
    after25,
    total
  }
}
