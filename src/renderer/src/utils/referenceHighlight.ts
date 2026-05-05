import constants from '@renderer/constants'

const standardReferenceValues = new Set(
  (constants.reference_light || []).map((option) => option?.value).filter(Boolean)
)

const childrenReferenceValues = new Set(
  (constants.reference_menage_children || []).map((option) => option?.value).filter(Boolean)
)

export const getReferenceHighlightCategory = (
  reference?: string | number | null
): 'children' | 'standard' | 'other' | null => {
  if (!reference) return null

  const normalizedReference = `${reference}`

  if (childrenReferenceValues.has(normalizedReference)) {
    return 'children'
  }

  if (standardReferenceValues.has(normalizedReference)) {
    return 'standard'
  }

  return 'other'
}

export const getReferenceHighlightClass = (
  reference?: string | number | null,
  target: 'label' | 'amount' = 'label'
) => {
  const category = getReferenceHighlightCategory(reference)

  if (!category) return undefined

  return target === 'label' ? `table-ref-${category}` : `table-ref-${category}-amount`
}
