import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export const FadeIn = ({ children, show }) => {
  const [display, setDisplay] = useState(false)

  useEffect(() => {
    setDisplay(show)
  }, [show])

  return (
    <AnimatePresence>
      {display && (
        <motion.div
          initial={{ opacity: 0 }} // L'opacité initiale
          animate={{ opacity: 1 }} // L'opacité finale
          transition={{ duration: 0 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FadeIn
