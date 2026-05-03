import { useMemo, useRef } from 'react'
import Money from './money'
import TextItem from './textItem'
import { useMoneyScopeTotal } from './moneyScope'

let totalBoxCounter = 0

export const TotalBox = ({ name, label, selector, value, negative, calc }) => {
  const totalBoxId = useRef(`total-box-${totalBoxCounter++}`)
  const targetGroup = selector || name || 'money'
  const scopedTotal = useMoneyScopeTotal(targetGroup, totalBoxId.current)

  const total = useMemo(() => {
    const baseTotal = value ?? scopedTotal
    const parsedTotal = parseFloat(`${baseTotal || 0}`) || 0
    const computedTotal = calc ? calc(parsedTotal) : parsedTotal

    return negative ? -computedTotal : computedTotal
  }, [calc, negative, scopedTotal, value])

  return (
    <div className="total-box">
      {label && <TextItem tag="strong" path={label} />}
      <Money
        className={`total${name ? '-' + name : ''}`}
        registryId={totalBoxId.current}
        value={total}
        ignore={true}
        span={undefined}
        tooltip={undefined}
      />
    </div>
  )
}

export default TotalBox
