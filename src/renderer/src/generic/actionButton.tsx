import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ActionMenuButton = ({ label, actions }) => {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev)
  }

  const handleOptionClick = (option: string) => {
    if (option?.action) option?.action()
    setMenuOpen(false) // Fermer le menu après avoir cliqué
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpen(false) // Ferme le menu si on clique en dehors
    }
  }

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Nettoyer l'écouteur d'événements pour éviter des fuites de mémoire
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
      {/* Bouton principal */}
      <button onClick={toggleMenu}>{label || 'Actions'}</button>

      {/* Menu des options */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: '10px',
              left: '100%',
              marginLeft: '10px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              width: '150px'
            }}
          >
            <ul style={{ listStyle: 'none', padding: '2px', margin: 0 }}>
              {(actions || []).map((option, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleOptionClick(option)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      color: '#333',
                      margin: 0
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {option?.label || 'Option ' + index}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ActionMenuButton
