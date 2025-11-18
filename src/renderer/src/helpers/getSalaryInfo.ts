type SalaryValues = {
  day?: number | string
  monthly?: number | string
  yearly?: number | string
}

const parseNumber = (value: any) => {
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const resolveSalaryInfo = (
  value: any,
  salaryValues?: SalaryValues
): { amount: number; source: 'day' | 'monthly' | 'yearly' | 'custom'; divisor: number } => {
  const numericValue = parseNumber(value)

  if (numericValue === undefined) {
    return { amount: 0, source: 'custom', divisor: 365 }
  }

  const day = parseNumber(salaryValues?.day)
  const monthly = parseNumber(salaryValues?.monthly)
  const yearly = parseNumber(salaryValues?.yearly)

  if (day !== undefined) {
    if (numericValue === day) {
      return { amount: day, source: 'day', divisor: 1 }
    }
  }

  if (monthly !== undefined) {
    if (numericValue === monthly) {
      return { amount: monthly, source: 'monthly', divisor: 365 / 12 }
    }
  }

  if (yearly !== undefined && numericValue === yearly) {
    return { amount: yearly, source: 'yearly', divisor: 365 }
  }

  return { amount: numericValue, source: 'custom', divisor: 365 }
}

export default resolveSalaryInfo
