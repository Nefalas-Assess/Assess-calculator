import { AppContext } from '@renderer/providers/AppProvider'
import { intervalToDuration } from 'date-fns'
import { useContext, useEffect, useState } from 'react'

const getCapitalizationTable = async (
  ref: string,
  sexe: string
): Promise<Record<string, number[]> | null> => {
  // Import dynamique des tables de capitalisation
  const getTableModule = async (
    gender: string,
    suffix = ''
  ): Promise<Record<string, number[]> | null> => {
    try {
      console.log(`@renderer/data/data_cap_${gender}${suffix}.tsx`)
      const module = await import(`@renderer/data/data_cap_${gender}${suffix}.tsx`)
      return module.default
    } catch (e) {
      return null
    }
  }

  // Extraction du suffixe de la référence (ex: schryvers_55 -> _55)
  const suffix = ref?.includes('schryvers_') ? ref?.replace('schryvers_', '') : ''
  let treatedSuffix
  if (suffix?.includes('_y')) {
    treatedSuffix = suffix?.replace('_y', '_an_2025')
  } else if (suffix?.includes('_m')) {
    treatedSuffix = suffix?.replace('_m', '_mois_2025')
  } else {
    treatedSuffix = suffix
  }

  try {
    if (sexe === 'homme') {
      return await getTableModule('h', treatedSuffix)
    } else {
      return await getTableModule('f', treatedSuffix)
    }
  } catch (error) {
    console.error('Error loading capitalization table:', error)
    return null
  }
}

export const useCapitalization = (props = {}) => {
  const { end, start, amount, ref, index, asObject } = props
  const { data } = useContext(AppContext)

  const sexe = data?.general_info?.sexe

  const { years: age = 0 } = intervalToDuration({
    start: start || new Date(data?.general_info?.date_naissance),
    end
  })

  const [table, setTable] = useState(null)

  useEffect(() => {
    const loadTable = async () => {
      const loadedTable = await getCapitalizationTable(ref, sexe)
      setTable(loadedTable)
    }
    loadTable()
  }, [ref, sexe])

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
