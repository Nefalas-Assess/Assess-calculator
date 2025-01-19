const Money = ({ value, ignore }) => {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  })

  return <div className={ignore ? '' : 'money'}>{formatter?.format(value)}</div>
}

export default Money
