import rates from '@renderer/data/data_taux'
import {
  startOfYear,
  endOfYear,
  differenceInCalendarDays,
  isWithinInterval,
  format,
  isValid
} from 'date-fns'
import Tooltip from './tooltip'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaRegQuestionCircle } from 'react-icons/fa'
import Money from './money'
import { FaArrowRightLong } from 'react-icons/fa6'

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
  return found ? parseFloat(found.amount) : parseFloat(rates[0]?.amount)
}

const Interest = ({ amount, start, end }) => {
  const [info, setInfo] = useState([])

  const ranges = useMemo(() => getDaysPerYearInRange(start, end), [start, end])

  const total = useMemo(() => {
    let res = parseFloat(amount)
    const updatedInfo = []

    for (let i = 0; i < ranges.length; i += 1) {
      const item = ranges[i]
      const taxe = getAmountForYear(item?.year) / 100
      updatedInfo.push({
        ...item,
        taxe: taxe,
        amount: res
      })

      res += res * taxe * (item?.days / 365)
    }

    setInfo(updatedInfo)

    return res
  }, [amount, ranges])

  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  })

  const renderToolTipContent = useCallback(() => {
    return (
      <div>
        <div>
          Intéret calculé pour la période:
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {start && isValid(start) && format(start, 'dd/MM/yyyy')} <FaArrowRightLong />{' '}
            {end && isValid(end) && format(end, 'dd/MM/yyyy')}
          </div>
        </div>
        {info?.map((it, key) => (
          <div key={key}>
            <div>Pour {it?.year}:</div>
            <div>
              <math>
                <mn>{it?.amount}</mn>
                <mo>x</mo>
                <mn>{it?.taxe}</mn>
                <mo>x</mo>
                <mo>(</mo>
                <mfrac>
                  <mn>{it?.days}</mn>
                  <mn>365</mn>
                </mfrac>
                <mn>=</mn>
                <mn>{it?.days / 365}</mn>
                <mo>)</mo>
                <mo>=</mo>
                <mn>{it?.amount * it?.taxe * (it?.days / 365)}</mn>
              </math>
            </div>
          </div>
        ))}
      </div>
    )
  }, [info, start, end, amount])

  if (!start) return 'Missing start date'
  if (!end) return 'Missing end date'
  if (!amount) return 'Missing amount'

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="interest">{formatter?.format(total - parseFloat(amount))}</div>
      <Tooltip tooltipContent={renderToolTipContent()}>
        <FaRegQuestionCircle style={{ marginLeft: 5 }} />
      </Tooltip>
    </div>
  )
}

export default Interest
