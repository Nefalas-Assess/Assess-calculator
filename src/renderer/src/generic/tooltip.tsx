import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const Tooltip = ({ children, tooltipContent }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [position, setPosition] = useState('right') // "right" or "left"
  const tooltipRef = useRef(null)
  const containerRef = useRef(null)

  const handleMouseEnter = () => {
    if (containerRef.current && tooltipRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth

      // Vérifie si le tooltip déborde sur la droite
      if (containerRect.right + tooltipRect.width > viewportWidth) {
        setPosition('right')
      } else {
        setPosition('left')
      }
    }
    setIsHovered(true)
  }
  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  console.log('is hover', isHovered)

  return (
    <div
      ref={containerRef}
      className="tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* L'élément déclencheur */}
      <div className="tooltip-trigger">{children}</div>
      <div className="tooltip-box" style={{ zIndex: -100 }} ref={tooltipRef}>
        {tooltipContent}
      </div>

      {/* Le tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: position === 'right' ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: position === 'right' ? 10 : -10 }}
            className="tooltip-box"
            style={{
              [position]: 'calc(100% + 2px)' // Adjust position dynamically
            }}
          >
            {tooltipContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Tooltip
