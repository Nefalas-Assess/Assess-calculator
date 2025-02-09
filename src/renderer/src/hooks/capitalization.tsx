import data_cap_f from '@renderer/data/data_cap_f'
import data_cap_f60 from '@renderer/data/data_cap_f60'
import data_cap_f61 from '@renderer/data/data_cap_f61'
import data_cap_f62 from '@renderer/data/data_cap_f62'
import data_cap_f63 from '@renderer/data/data_cap_f63'
import data_cap_f64 from '@renderer/data/data_cap_f64'
import data_cap_f65 from '@renderer/data/data_cap_f65'
import data_cap_f66 from '@renderer/data/data_cap_f66'
import data_cap_f67 from '@renderer/data/data_cap_f67'
import data_cap_f68 from '@renderer/data/data_cap_f68'
import data_cap_f69 from '@renderer/data/data_cap_f69'
import data_cap_f70 from '@renderer/data/data_cap_f70'
import data_cap_f71 from '@renderer/data/data_cap_f71'
import data_cap_f72 from '@renderer/data/data_cap_f72'
import data_cap_f73 from '@renderer/data/data_cap_f73'
import data_cap_f74 from '@renderer/data/data_cap_f74'
import data_cap_f75 from '@renderer/data/data_cap_f75'
import data_cap_h from '@renderer/data/data_cap_h'
import data_cap_h60 from '@renderer/data/data_cap_h60'
import data_cap_h61 from '@renderer/data/data_cap_h61'
import data_cap_h62 from '@renderer/data/data_cap_h62'
import data_cap_h63 from '@renderer/data/data_cap_h63'
import data_cap_h64 from '@renderer/data/data_cap_h64'
import data_cap_h65 from '@renderer/data/data_cap_h65'
import data_cap_h66 from '@renderer/data/data_cap_h66'
import data_cap_h67 from '@renderer/data/data_cap_h67'
import data_cap_h68 from '@renderer/data/data_cap_h68'
import data_cap_h69 from '@renderer/data/data_cap_h69'
import data_cap_h70 from '@renderer/data/data_cap_h70'
import data_cap_h71 from '@renderer/data/data_cap_h71'
import data_cap_h72 from '@renderer/data/data_cap_h72'
import data_cap_h73 from '@renderer/data/data_cap_h73'
import data_cap_h74 from '@renderer/data/data_cap_h74'
import data_cap_h75 from '@renderer/data/data_cap_h75'
import { AppContext } from '@renderer/providers/AppProvider'
import { intervalToDuration } from 'date-fns'
import { useContext } from 'react'

const getCapitalizationTable = (ref, sexe) => {
  switch (ref) {
    case 'schryvers_60':
      return sexe === 'homme' ? data_cap_h60 : data_cap_f60
    case 'schryvers_61':
      return sexe === 'homme' ? data_cap_h61 : data_cap_f61
    case 'schryvers_62':
      return sexe === 'homme' ? data_cap_h62 : data_cap_f62
    case 'schryvers_63':
      return sexe === 'homme' ? data_cap_h63 : data_cap_f63
    case 'schryvers_64':
      return sexe === 'homme' ? data_cap_h64 : data_cap_f64
    case 'schryvers_65':
      return sexe === 'homme' ? data_cap_h65 : data_cap_f65
    case 'schryvers_66':
      return sexe === 'homme' ? data_cap_h66 : data_cap_f66
    case 'schryvers_67':
      return sexe === 'homme' ? data_cap_h67 : data_cap_f67
    case 'schryvers_68':
      return sexe === 'homme' ? data_cap_h68 : data_cap_f68
    case 'schryvers_69':
      return sexe === 'homme' ? data_cap_h69 : data_cap_f69
    case 'schryvers_70':
      return sexe === 'homme' ? data_cap_h70 : data_cap_f70
    case 'schryvers_71':
      return sexe === 'homme' ? data_cap_h71 : data_cap_f71
    case 'schryvers_72':
      return sexe === 'homme' ? data_cap_h72 : data_cap_f72
    case 'schryvers_73':
      return sexe === 'homme' ? data_cap_h73 : data_cap_f73
    case 'schryvers_74':
      return sexe === 'homme' ? data_cap_h74 : data_cap_f74
    case 'schryvers_75':
      return sexe === 'homme' ? data_cap_h75 : data_cap_f75
    default:
      return sexe === 'homme' ? data_cap_h : data_cap_f
  }
}

export const useCapitalization = (props = {}) => {
  const { end, start, amount, ref, index } = props
  const { data } = useContext(AppContext)

  const sexe = data?.general_info?.sexe

  const { years: age = 0 } = intervalToDuration({
    start: start || new Date(data?.general_info?.date_naissance),
    end
  })

  const table = getCapitalizationTable(ref, sexe)

  const rowIndex = Object?.keys(table)?.findIndex((e) => parseInt(e) === (age || 0))
  const row = Object?.values(table)?.[rowIndex]

  if (amount) return amount * row[index]
  return row?.[index]
}
