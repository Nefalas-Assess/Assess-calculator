type DeepFallback<T = unknown> = ((context: DeepVisitContext) => T | undefined) | T | undefined

export interface DeepVisitContext {
  path: string
  parent: Record<string, unknown>
  key: string
  value: unknown
  exists: boolean
}

type DeepVisitor = (context: DeepVisitContext) => void

export interface DeepKeyOptions {
  ensureKey?: boolean
  filter?: (context: DeepVisitContext) => boolean
}

const appendPathSegment = (base: string, segment: string): string => {
  if (!base) return segment
  if (segment.startsWith('[')) return `${base}${segment}`
  return `${base}.${segment}`
}

const walkMatchingKeys = (
  value: unknown,
  keyName: string,
  visitor: DeepVisitor,
  options: DeepKeyOptions,
  currentPath = ''
): void => {
  if (value === null || typeof value !== 'object') {
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const nextPath = appendPathSegment(currentPath, `[${index}]`)
      walkMatchingKeys(item, keyName, visitor, options, nextPath)
    })
    return
  }

  const currentObject = value as Record<string, unknown>

  if (options.ensureKey && !(keyName in currentObject)) {
    visitor({
      path: appendPathSegment(currentPath, keyName),
      parent: currentObject,
      key: keyName,
      value: undefined,
      exists: false
    })
  }

  Object.entries(currentObject).forEach(([key, val]) => {
    const nextPath = appendPathSegment(currentPath, key)
    if (key === keyName) {
      visitor({
        path: nextPath,
        parent: currentObject,
        key,
        value: val,
        exists: true
      })
    }
    walkMatchingKeys(val, keyName, visitor, options, nextPath)
  })
}

export const logKeyPaths = (value: unknown, keyName: string): void => {
  walkMatchingKeys(
    value,
    keyName,
    ({ path }) => {
      console.log(path)
    },
    {}
  )
}

const isFallbackFn = <T>(
  value: DeepFallback<T>
): value is (context: DeepVisitContext) => T | undefined => {
  return typeof value === 'function'
}

export const setMissingKeyDeep = <T>(
  target: T,
  keyName: string,
  fallback?: DeepFallback,
  options: DeepKeyOptions = {}
): T => {
  const resolveFallback: (ctx: DeepVisitContext) => unknown = isFallbackFn(fallback)
    ? fallback
    : () => fallback

  walkMatchingKeys(
    target,
    keyName,
    (context) => {
      if (options.filter && !options.filter(context)) {
        return
      }

      const { parent, key, value } = context
      if (value === undefined || value === null || value === '') {
        const nextValue = resolveFallback(context)
        if (nextValue !== undefined) {
          ;(parent as Record<string, unknown>)[key] = nextValue
        }
      }
    },
    options
  )

  return target
}

export const createMissingKeySetter =
  (keyName: string) =>
  <T>(target: T, fallback?: DeepFallback, options?: DeepKeyOptions): T =>
    setMissingKeyDeep(target, keyName, fallback, options)

export const setDatePaiementIfMissing = createMissingKeySetter('date_paiement')

const isPaymentDateKey = (key: string): boolean => {
  return key === 'paiement' || key.includes('date_paiement')
}

const normalizeDateValue = (value: unknown): string | null => {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  if (typeof value === 'string') {
    return value.slice(0, 10)
  }

  return null
}

export type ReplaceDefaultPaymentDateMode = 'matching-default' | 'all-payment-dates'

export const replaceDefaultPaymentDates = <T>(
  target: T,
  previousDefault: unknown,
  nextDefault: unknown,
  mode: ReplaceDefaultPaymentDateMode = 'matching-default'
): T => {
  const previousDate = normalizeDateValue(previousDefault)
  const nextDate = normalizeDateValue(nextDefault)

  if (!nextDate || (mode === 'matching-default' && (!previousDate || previousDate === nextDate))) {
    return target
  }

  const replaceMatchingDates = (value: unknown): void => {
    if (value === null || typeof value !== 'object') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach(replaceMatchingDates)
      return
    }

    const currentObject = value as Record<string, unknown>
    Object.entries(currentObject).forEach(([key, val]) => {
      const shouldReplace =
        isPaymentDateKey(key) &&
        (mode === 'all-payment-dates' || normalizeDateValue(val) === previousDate)

      if (shouldReplace) {
        currentObject[key] = nextDefault
        return
      }

      replaceMatchingDates(val)
    })
  }

  replaceMatchingDates(target)
  return target
}
