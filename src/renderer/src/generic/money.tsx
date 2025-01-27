const Money = ({ value, ignore, span }) => {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  })

  if (span) return <span>{formatter?.format(value)}</span>

  return <div className={ignore ? '' : 'money'}>{formatter?.format(value)}</div>
}

export default Money
