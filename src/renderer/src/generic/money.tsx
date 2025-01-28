import { useCallback } from 'react'

const Money = ({ value, ignore, span, className }) => {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  })

  const getClassName = useCallback(() => {
    if (className) return className

    if (ignore) return

    return 'money'
  }, [className])

  if (span) return <span>{formatter?.format(value)}</span>

  return <div className={getClassName()}>{formatter?.format(value)}</div>
}

export default Money
