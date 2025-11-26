/**
 * Check whether at least one value is defined in any object of a collection.
 *
 * @param collection The list of objects to inspect.
 * @param keys Optional subset of keys to check; when omitted, all keys of each object are checked.
 * @returns true if a defined value is found, false otherwise.
 */
export const hasDefinedValues = (
  collection?: Array<Record<string, unknown>>,
  keys?: string[]
): boolean => {
  if (!Array.isArray(collection) || collection.length === 0) {
    return false
  }

  return collection.some((item) => {
    if (!item || typeof item !== 'object') {
      return false
    }

    const targetKeys = keys && keys.length > 0 ? keys : Object.keys(item)
    return targetKeys.some((key) => item[key] !== undefined && item[key] !== '' && item[key] !== 0)
  })
}

export default hasDefinedValues
