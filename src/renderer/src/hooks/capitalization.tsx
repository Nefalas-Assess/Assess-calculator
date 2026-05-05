import { useAppData } from '@renderer/providers/AppProvider'
import { addYears, differenceInDays, intervalToDuration } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'

type CapitalizationTable = Record<string, number[]>

type TableCacheEntry = {
  promise?: Promise<CapitalizationTable | null>
  value?: CapitalizationTable | null
}

const tableCache = new Map<string, TableCacheEntry>()

const getCapitalizationGender = (sexe?: string | null) => {
  if (!sexe) return ''
  return sexe === 'homme' ? 'h' : 'f'
}

const getCapitalizationCacheKey = (ref: string, sexe?: string | null, base = 'data_cap') => {
  if (!ref) return null
  return `${base}::${ref}::${getCapitalizationGender(sexe)}`
}

const getCachedCapitalizationTable = (cacheKey: string | null) => {
  if (!cacheKey) return undefined
  return tableCache.get(cacheKey)?.value
}

export const getCapitalizationTable = async (
  ref: string,
  sexe: string | null,
  base?: string
): Promise<CapitalizationTable | null> => {
  // Import dynamique des tables de capitalisation
  const getTableModule = async (
    path: string[],
    gender: string,
    suffix = '',
    base = 'data_cap'
  ): Promise<CapitalizationTable | null> => {
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

const loadCapitalizationTable = (
  ref: string,
  sexe?: string | null,
  base = 'data_cap'
): Promise<CapitalizationTable | null> => {
  const cacheKey = getCapitalizationCacheKey(ref, sexe, base)

  if (!cacheKey) {
    return Promise.resolve(null)
  }

  const cachedEntry = tableCache.get(cacheKey)

  if (cachedEntry?.value !== undefined) {
    return Promise.resolve(cachedEntry.value)
  }

  if (cachedEntry?.promise) {
    return cachedEntry.promise
  }

  const promise = getCapitalizationTable(ref, sexe, base).then((table) => {
    tableCache.set(cacheKey, { value: table })
    return table
  })

  tableCache.set(cacheKey, { promise })

  return promise
}

const getPerDays = (currentYear: number, nextYear: number) => {
  // Check if difference is negative
  if (currentYear - nextYear < 0) {
    return {
      day: nextYear - currentYear,
      year: currentYear,
      before: nextYear,
      after: currentYear
    }
  }

  return {
    day: currentYear - nextYear,
    year: currentYear,
    before: currentYear,
    after: nextYear
  }
}

const getValue = (days, info, current, isDecreasingTable) => {
  if (days === 0) return current

  if (isDecreasingTable) {
    return info?.year - (info?.day / 365) * days
  }
  return info?.year + (info?.day / 365) * days
}

export const useCapitalization = (props = {}) => {
  const { end, start, ref, index, startIndex = 0, asObject, base, noGender = false } = props
  const data = useAppData()

  const sexe = data?.general_info?.sexe
  const effectiveGender = noGender ? null : sexe

  const cacheKey = useMemo(
    () => getCapitalizationCacheKey(ref, effectiveGender, base),
    [base, effectiveGender, ref]
  )

  const startDate = start || new Date(data?.general_info?.date_naissance)

  const { years: age = 0 } = intervalToDuration({
    start: startDate,
    end
  })

  const days = differenceInDays(end, addYears(startDate, age))

  const [table, setTable] = useState<CapitalizationTable | null | undefined>(() =>
    getCachedCapitalizationTable(cacheKey)
  )

  useEffect(() => {
    if (!cacheKey) {
      setTable(null)
      return
    }

    const cachedTable = getCachedCapitalizationTable(cacheKey)
    if (cachedTable !== undefined) {
      setTable(cachedTable)
      return
    }

    setTable(undefined)

    let active = true

    loadCapitalizationTable(ref, effectiveGender, base).then((loadedTable) => {
      if (active) {
        setTable(loadedTable)
      }
    })

    return () => {
      active = false
    }
  }, [base, cacheKey, effectiveGender, ref])

  if (!table) return null

  const ageIndex = age - startIndex

  const rowIndex = Object.keys(table).findIndex((e) => parseInt(e) === (ageIndex || 0))

  const row = Object.values(table)[rowIndex]

  const next = Object.values(table)[rowIndex + 1]

  const currentYear = row?.[index] || 0
  const nextYear = next?.[index]

  const perDays = getPerDays(currentYear, nextYear)

  const isDecreasingTable = currentYear > nextYear

  const value = getValue(days, perDays, currentYear, isDecreasingTable)

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
            <mn>{perDays?.before}</mn>
            <mo>-</mo>
            <mn>{perDays?.after}</mn>
          </math>
        </div>
        <div>
          <math>
            <mn>{perDays?.year}</mn>
            {isDecreasingTable ? <mo>-</mo> : <mo>+</mo>}
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
    return { value, info: { ...coefficientInfo, startIndex } }
  }
}
