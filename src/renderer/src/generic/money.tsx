const Money = ({ value, ignore, span, className }) => {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  })

  if (span) return <span>{formatter?.format(value)}</span>

  return <div className={`${className} ${ignore ? '' : 'money'} `}>{formatter?.format(value)}</div>
}

export default Money
