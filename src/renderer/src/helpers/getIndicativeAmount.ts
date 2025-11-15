const parseNumericValue = (value?: string | number | null): number => {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') {
      return Number.NaN
    }

    return parseFloat(trimmed)
  }

  return Number.NaN
}

export const getIndicativeAmount = (
  value: string | number | null | undefined,
  fallback: string | number
): number => {
  const parsedValue = parseNumericValue(value)

  if (!Number.isNaN(parsedValue)) {
    return parsedValue
  }

  const parsedFallback = parseNumericValue(fallback)
  return Number.isNaN(parsedFallback) ? 0 : parsedFallback
}

export default getIndicativeAmount
