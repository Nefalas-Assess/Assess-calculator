import { useCallback } from 'react'
import Tooltip from './tooltip'
import { FaRegQuestionCircle } from 'react-icons/fa'

const Money = ({ value, ignore, span, className, tooltip }) => {
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
