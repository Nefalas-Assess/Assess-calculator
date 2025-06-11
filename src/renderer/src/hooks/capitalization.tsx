import { AppContext } from '@renderer/providers/AppProvider'
import { addYears, differenceInDays, intervalToDuration } from 'date-fns'
import { useContext, useEffect, useState } from 'react'

export const getCapitalizationTable = async (
  ref: string,
  sexe: string,
  base?: string
): Promise<Record<string, number[]> | null> => {
  // Import dynamique des tables de capitalisation
  const getTableModule = async (
    path: string[],
    gender: string,
    suffix = '',
    base = 'data_cap'
  ): Promise<Record<string, number[]> | null> => {
    try {
      let endPath = `${base}_${gender}${suffix}`
      if (!gender && !suffix) endPath = base
      const module = await import(`@renderer/data/${path[0]}/${path[1]}/${endPath}.tsx`)
      return module.default
    } catch (e) {
      console.error('Error loading capitalization table:', e)
      return null
    }
  }

  const splittedRef = ref?.split('_')
  const baseDist = splittedRef?.[0]
  const year = splittedRef?.[1]
  const sheet = splittedRef?.slice(2).join('_')

  const path = [baseDist, year]
  let treatedSuffix = sheet

  if (treatedSuffix && !treatedSuffix?.startsWith('_') && sexe) {
    treatedSuffix = `_${treatedSuffix}`
  }

  if (!path[0] || !path[1]) {
    return null
  }

  try {
    if (!sexe) {
      return await getTableModule(path, '', treatedSuffix, base)
    } else if (sexe === 'homme') {
      return await getTableModule(path, 'h', treatedSuffix, base)
    } else {
      return await getTableModule(path, 'f', treatedSuffix, base)
    }
  } catch (error) {
    console.error('Error loading capitalization table:', error)
    return null
  }
}

const getPerDays = (currentYear: number, nextYear: number) => {
  // Check if difference is negative
  if (currentYear - nextYear < 0) {
    return { day: nextYear - currentYear, year: currentYear }
  }

  return { day: currentYear - nextYear, year: nextYear }
}

export const useCapitalization = (props = {}) => {
  const { end, start, ref, index, asObject, base, noGender = false } = props
  const { data } = useContext(AppContext)

  const sexe = data?.general_info?.sexe

  const startDate = start || new Date(data?.general_info?.date_naissance)

  const { years: age = 0 } = intervalToDuration({
    start: startDate,
    end
  })

  const days = differenceInDays(end, addYears(startDate, age))

  const [table, setTable] = useState(null)

  useEffect(() => {
    const loadTable = async () => {
      const loadedTable = await getCapitalizationTable(ref, noGender ? null : sexe, base)
      setTable(loadedTable)
    }
    loadTable()
  }, [ref, sexe, base, noGender])

  if (!table) return null

  const rowIndex = Object.keys(table).findIndex((e) => parseInt(e) === (age || 0))
  const row = Object.values(table)[rowIndex]

  const next = Object.values(table)[rowIndex + 1]
  const currentYear = row?.[index]
  const nextYear = next?.[index]

  const perDays = getPerDays(currentYear, nextYear)

  const value = days !== 0 ? perDays?.year + (perDays?.day / 365) * days : currentYear

  const coefficientInfo = {
    index: [rowIndex, index],
    table,
    explanation: days !== 0 && (
      <div>
        <div>
          <math>
            <mo>(</mo>
            <mi>A</mi>
            <mo>)</mo>
            <mo>=</mo>
            <mn>{currentYear}</mn>
            <mo>-</mo>
            <mn>{nextYear}</mn>
          </math>
        </div>
        <div>
          <math>
            <mn>{nextYear}</mn>
            <mo>+</mo>
            <mo>(</mo>
            <mfrac>
              <mi>A</mi>
              <mn>365</mn>
            </mfrac>
            <mo>x</mo>
            <mn>{days}</mn>
            <mo>)</mo>
            <mo>=</mo>
            <mn>{value}</mn>
          </math>
        </div>
      </div>
    )
  }

  if (!asObject) {
    return value
  } else {
    return { value, info: coefficientInfo }
  }
}
