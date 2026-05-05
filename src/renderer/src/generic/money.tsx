import { useCallback, useRef } from 'react'
import Tooltip from './tooltip'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { useMoneyRegistration } from './moneyScope'

let moneyCounter = 0

const Money = ({ value, ignore, span, className, tooltip, registryId }) => {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  })
  const generatedId = useRef(registryId || `money-${moneyCounter++}`)

  const getClassName = useCallback(() => {
    if (className) return className
    if (ignore) return
    return 'money'
  }, [className, ignore])

  const group = getClassName()

  useMoneyRegistration({
    id: generatedId.current,
    group: span ? undefined : group,
    value: parseFloat(`${value || 0}`) || 0
  })

  if (span) return <span>{formatter?.format(value)}</span>

  return (
    <div
      className={getClassName()}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {formatter?.format(value)}
      {tooltip && (
        <Tooltip tooltipContent={tooltip}>
          <FaRegQuestionCircle style={{ marginLeft: '5px' }} />
        </Tooltip>
      )}
    </div>
  )
}

export default Money
