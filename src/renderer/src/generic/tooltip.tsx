import React, { useState } from 'react'
import { motion } from 'framer-motion'

const Tooltip = ({ children, tooltipContent }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* L'élément déclencheur */}
      <div className="tooltip-trigger">{children}</div>

      {/* Le tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="tooltip-box"
        >
          {tooltipContent}
        </motion.div>
      )}
    </div>
  )
}

export default Tooltip
