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
