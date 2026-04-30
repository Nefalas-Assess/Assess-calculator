const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number.parseFloat(`${value ?? ''}`)
  return Number.isFinite(parsed) ? parsed : fallback
}

const getTwentyFifthBirthday = (birthDate?: string | null): Date | null => {
  if (!birthDate) return null

  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return null

  const date25 = new Date(birth)
  date25.setFullYear(birth.getFullYear() + 25)
  return date25
}

export default (data: any) => {
  if (!data?.general_info) {
    return data
  }

  data.general_info.student = {
    lives_with_parents: false,
    leave_home_age: 25,
    ...(data.general_info.student || {})
  }

  if (!data?.incapacite_perma_menage_cap) {
    return data
  }

  const menageCap = data.incapacite_perma_menage_cap
  const config = data.general_info.config || {}
  const defaultContribution = menageCap.perso_contribution ?? config.default_contribution
  const indicativeAmount = toNumber(config.incapacite_menagere, 30)
  const personChargeAmount = toNumber(config.person_charge, 10)

  if (menageCap.student_home_amount === undefined) {
    menageCap.student_home_amount = menageCap.perso_amount ?? indicativeAmount
  }
  if (menageCap.student_home_contribution === undefined) {
    menageCap.student_home_contribution = defaultContribution
  }
  if (menageCap.student_after_home_amount === undefined) {
    menageCap.student_after_home_amount = menageCap.perso_amount ?? indicativeAmount
  }
  if (menageCap.student_after_home_contribution === undefined) {
    menageCap.student_after_home_contribution = 100
  }

  const paymentDate = menageCap.paiement ? new Date(menageCap.paiement) : null
  if (!paymentDate || Number.isNaN(paymentDate.getTime())) {
    return data
  }

  const children = Array.isArray(data.general_info.children) ? data.general_info.children : []
  const sortedChildren = children
    .filter((child) => {
      if (!child?.birthDate) return false
      const date25 = getTwentyFifthBirthday(child.birthDate)
      return !!date25 && date25 > paymentDate
    })
    .sort(
      (a, b) =>
        new Date(a?.birthDate || 0).getTime() - new Date(b?.birthDate || 0).getTime()
    )

  const unsortedChildrenCount = children.filter((child) => !child?.birthDate).length
  const baseAmount = toNumber(menageCap.perso_amount, indicativeAmount)

  sortedChildren.forEach((_, key) => {
    const amountField = `perso_child_amount_${key}`
    const contributionField = `perso_child_contribution_${key}`

    if (menageCap[amountField] === undefined) {
      menageCap[amountField] =
        baseAmount +
        personChargeAmount * unsortedChildrenCount +
        personChargeAmount * (sortedChildren.length - key)
    }

    if (menageCap[contributionField] === undefined) {
      menageCap[contributionField] = defaultContribution
    }
  })

  if (menageCap.perso_child_amount_final === undefined) {
    menageCap.perso_child_amount_final =
      baseAmount + personChargeAmount * unsortedChildrenCount
  }

  if (menageCap.perso_child_contribution_final === undefined) {
    menageCap.perso_child_contribution_final = defaultContribution
  }

  return data
}
