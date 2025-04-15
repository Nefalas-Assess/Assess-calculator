import { AppContext } from '@renderer/providers/AppProvider'
import { intervalToDuration } from 'date-fns'
import { useContext, useEffect, useState } from 'react'

export const getCapitalizationTable = async (
  ref: string,
  sexe: string,
  base?: string
): Promise<Record<string, number[]> | null> => {
  // Import dynamique des tables de capitalisation
  const getTableModule = async (
    gender: string,
    suffix = '',
    base = 'data_cap'
  ): Promise<Record<string, number[]> | null> => {
    try {
      console.log(`@renderer/data/${base}_${gender}${suffix}.tsx`)
      const module = await import(`@renderer/data/${base}_${gender}${suffix}.tsx`)
      return module.default
    } catch (e) {
      return null
    }
  }

  // Extraction du suffixe de la référence (ex: schryvers_55 -> _55)
  const suffix = ref?.includes('schryvers_') ? ref?.replace('schryvers_', '') : ''
  let treatedSuffix
  if (suffix?.endsWith('_y')) {
    treatedSuffix = suffix?.replace('_y', '_an_2025')
  } else if (suffix?.endsWith('_m')) {
    treatedSuffix = suffix?.replace('_m', '_mois_2025')
  } else {
    treatedSuffix = suffix
  }

  if (!treatedSuffix?.startsWith('_') && sexe) {
    treatedSuffix = `_${treatedSuffix}`
  }

  try {
    if (!sexe) {
      return await getTableModule('', treatedSuffix, base)
    } else if (sexe === 'homme') {
      return await getTableModule('h', treatedSuffix, base)
    } else {
      return await getTableModule('f', treatedSuffix, base)
    }
  } catch (error) {
    console.error('Error loading capitalization table:', error)
    return null
  }
}

export const useCapitalization = (props = {}) => {
  const { end, start, amount, ref, index, asObject, base, noGender = false } = props
  const { data } = useContext(AppContext)

  const sexe = data?.general_info?.sexe

  const { years: age = 0 } = intervalToDuration({
    start: start || new Date(data?.general_info?.date_naissance),
    end
  })

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

  let value = row?.[index]
  if (amount) value = amount * row[index]

  if (!asObject) {
    return value
  } else {
    return { table, value, index: [rowIndex, index] }
  }
}
