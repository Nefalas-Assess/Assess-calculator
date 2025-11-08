import { useSideContext } from '@renderer/providers/SideProvider'

const CoefficientInfo = ({ children, ...rest }) => {
  const { openSide } = useSideContext()

  const handleClick = () => {
    openSide(rest)
  }

  return (
    <div>
      <div
        onClick={handleClick}
        style={{ textDecoration: 'underline', cursor: 'pointer' }}
      >
        {children}
      </div>
    </div>
  )
}

export default CoefficientInfo
