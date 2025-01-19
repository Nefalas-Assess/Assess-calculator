import rates from '@renderer/data/data_taux'
import { startOfYear, endOfYear, differenceInCalendarDays, isWithinInterval } from 'date-fns'

const getDaysPerYearInRange = (startDate, endDate) => {
  const result = []

  const startYear = startOfYear(startDate)
  const endYear = endOfYear(endDate)

  // Parcourt chaque année dans l'intervalle
  for (let year = startYear; year <= endYear; year.setFullYear(year.getFullYear() + 1)) {
    const currentYearStart = startOfYear(year)
    const currentYearEnd = endOfYear(year)

    // Détermine l'intervalle pour cette année
    const yearInterval = {
      start: currentYearStart,
      end: currentYearEnd
    }

    // Ajuste l'intervalle pour qu'il soit dans la plage des dates fournies
    const adjustedInterval = {
      start: isWithinInterval(startDate, yearInterval) ? startDate : currentYearStart,
      end: isWithinInterval(endDate, yearInterval) ? endDate : currentYearEnd
    }

    // Calcule le nombre de jours pour cette année
    const daysInYear = differenceInCalendarDays(adjustedInterval.end, adjustedInterval.start) + 1

    result.push({
      year: currentYearStart.getFullYear(),
      days: daysInYear
    })
  }

  return result
}

const getAmountForYear = (year) => {
  // Convertit l'année en chaîne si nécessaire
  const yearStr = String(year)

  // Cherche l'objet correspondant
  const found = rates.find((entry) => yearStr >= entry.start && yearStr <= entry.end)

  // Retourne l'amount ou null si non trouvé
  return found ? parseFloat(found.amount) : null
}

const Interest = ({ amount, start, end }) => {
  const ranges = getDaysPerYearInRange(start, end)

  let total = parseFloat(amount)

  for (let i = 0; i < ranges.length; i += 1) {
    const item = ranges[i]
    const taxe = getAmountForYear(item?.year) / 100
    total += total * taxe * (item?.days / 365)
  }

  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  })

  return <div className="interest">{formatter?.format(total - parseFloat(amount))}</div>
}

export default Interest
