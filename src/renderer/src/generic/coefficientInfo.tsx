import { useEffect, useState } from 'react'
import TextItem from './textItem'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

const Side = ({ isOpen, onClose, headers, index, table, startIndex = 0 }) => {
  // Créer un élément DOM pour y attacher le portail
  const modalRoot = document.getElementById('root')

  if (!isOpen) return null

  return modalRoot
    ? createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay avec animation d'apparition/disparition */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 999
                }}
                onClick={onClose}
              />

              {/* Menu latéral avec animation de slide */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  height: '100vh',
                  zIndex: 1000,
                  overflow: 'scroll'
                }}
              >
                <table className="coefficient-table">
                  {headers && Array.isArray(headers) && (
                    <thead>
                      <tr>
                        <th></th>
                        {headers.map((it, key) => (
                          <th key={key} className={key === index?.[1] && 'highlight'}>
                            <TextItem path={it?.label}></TextItem>
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {Object?.values(table).map((row, i) => (
                      <tr key={i}>
                        <td className={i === index?.[0] && 'highlight'}>{startIndex + i}</td>
                        {Object.values(row).map((value, y) => (
                          <td
                            key={y}
                            className={
                              (y === index?.[1] && i === index?.[0] && 'selected') ||
                              (y === index?.[1] && 'highlight') ||
                              (i === index?.[0] && 'highlight')
                            }
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        modalRoot
      )
    : null
}

const CoefficientInfo = ({ children, ...rest }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div>
      <div
        onClick={() => setMenuOpen(true)}
        style={{ textDecoration: 'underline', cursor: 'pointer' }}
      >
        {children}
      </div>
      <Side isOpen={menuOpen} onClose={() => setMenuOpen(false)} {...rest} />
    </div>
  )
}

export default CoefficientInfo
