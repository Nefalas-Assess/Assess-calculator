import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactDOM from 'react-dom'

const TOOLTIP_OFFSET = 8
const VIEWPORT_MARGIN = 8

let tooltipPortalRoot: HTMLDivElement | null = null

const getTooltipPortalRoot = () => {
  if (typeof document === 'undefined') return null

  if (!tooltipPortalRoot) {
    tooltipPortalRoot = document.createElement('div')
    tooltipPortalRoot.setAttribute('id', 'tooltip-portal-root')
    document.body.appendChild(tooltipPortalRoot)
  }

  return tooltipPortalRoot
}

const Tooltip = ({ children, tooltipContent, contentStyle = {}, style = {} }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'left' | 'right'>('right')
  const [coordinates, setCoordinates] = useState({ top: 0, left: 0, ready: false })
  const containerRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const portalRoot = getTooltipPortalRoot()

  const updatePosition = useCallback(() => {
    if (!containerRef.current || !tooltipRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const canFitRight =
      containerRect.right + TOOLTIP_OFFSET + tooltipRect.width <= window.innerWidth
    const nextPosition = canFitRight ? 'right' : 'left'
    const nextLeft =
      nextPosition === 'right'
        ? Math.min(
            containerRect.right + TOOLTIP_OFFSET,
            window.innerWidth - tooltipRect.width - VIEWPORT_MARGIN
          )
        : Math.max(containerRect.left - tooltipRect.width - TOOLTIP_OFFSET, VIEWPORT_MARGIN)
    const nextTop = Math.min(
      Math.max(containerRect.top, VIEWPORT_MARGIN),
      window.innerHeight - tooltipRect.height - VIEWPORT_MARGIN
    )

    setPosition(nextPosition)
    setCoordinates({ top: nextTop, left: nextLeft, ready: true })
  }, [])

  useLayoutEffect(() => {
    if (!isOpen) {
      setCoordinates((prev) => (prev.ready ? { ...prev, ready: false } : prev))
      return
    }

    updatePosition()
  }, [isOpen, tooltipContent, updatePosition])

  useEffect(() => {
    if (!isOpen) return

    const handleViewportChange = () => updatePosition()

    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)

    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [isOpen, updatePosition])

  const openTooltip = useCallback(() => setIsOpen(true), [])
  const closeTooltip = useCallback(() => setIsOpen(false), [])

  return (
    <div
      ref={containerRef}
      className="tooltip-container"
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
      onFocus={openTooltip}
      onBlur={closeTooltip}
      style={style}
    >
      <div className="tooltip-trigger">{children}</div>
      {portalRoot &&
        ReactDOM.createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={tooltipRef}
                initial={{ opacity: 0, x: position === 'right' ? 10 : -10 }}
                animate={{ opacity: coordinates.ready ? 1 : 0, x: 0 }}
                exit={{ opacity: 0, x: position === 'right' ? 10 : -10 }}
                className="tooltip-box"
                style={{
                  ...contentStyle,
                  position: 'fixed',
                  top: coordinates.top,
                  left: coordinates.left,
                  zIndex: 998,
                  visibility: coordinates.ready ? 'visible' : 'hidden'
                }}
              >
                {tooltipContent}
              </motion.div>
            )}
          </AnimatePresence>,
          portalRoot
        )}
    </div>
  )
}

export default Tooltip
