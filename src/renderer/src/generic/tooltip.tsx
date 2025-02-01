import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactDOM from 'react-dom'

const Tooltip = ({ children, tooltipContent, contentStyle = {}, style = {} }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [position, setPosition] = useState('right') // "right" or "left"
  const tooltipRef = useRef(null)
  const containerRef = useRef(null)
  const portalRef = useRef(document.createElement('div')) // Référence pour le Portal

  // Ajouter l'élément Portal au DOM
  useEffect(() => {
    const portalElement = portalRef.current
    document.body.appendChild(portalElement)
    return () => {
      document.body.removeChild(portalElement)
    }
  }, [])

  const handleMouseEnter = () => {
    if (containerRef.current && tooltipRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth

      // Vérifie si le tooltip déborde sur la droite
      if (containerRect.right + tooltipRect.width > viewportWidth) {
        setPosition('left')
      } else {
        setPosition('right')
      }
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // Calculer la position du tooltip
  const getTooltipStyle = () => {
    if (containerRef.current && tooltipRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()

      return {
        ...contentStyle,
        position: 'fixed',
        top: containerRect.top + window.scrollY,
        left:
          position === 'right' ? containerRect.right + 5 : containerRect.left - tooltipRect.width,
        zIndex: 9999
      }
    }
    return contentStyle
  }

  return (
    <div
      ref={containerRef}
      className="tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      {/* L'élément déclencheur */}
      <div className="tooltip-trigger">{children}</div>
      <div className="tooltip-box" style={{ zIndex: -100 }} ref={tooltipRef}>
        {tooltipContent}
      </div>

      {/* Le tooltip rendu via un Portal */}
      {ReactDOM.createPortal(
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: position === 'right' ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: position === 'right' ? 10 : -10 }}
              className="tooltip-box"
              style={getTooltipStyle()}
            >
              {tooltipContent}
            </motion.div>
          )}
        </AnimatePresence>,
        portalRef.current
      )}
    </div>
  )
}

export default Tooltip
