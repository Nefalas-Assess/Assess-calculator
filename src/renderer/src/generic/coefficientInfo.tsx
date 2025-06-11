import { useEffect, useState } from 'react'
import TextItem from './textItem'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

const Explanation = ({ explanation }) => {
  return <div className="coef-explanation">{explanation}</div>
}

const Side = ({ isOpen, onClose, headers, index, table, startIndex = 0, explanation }) => {
  // Créer un élément DOM pour y attacher le portail
  const modalRoot = document.getElementsByClassName('app-layout')[0]

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
                onClick={(e) => {
                  // Check if click is in thead or tbody
                  const thead = e.target.closest('thead')
                  const tbody = e.target.closest('tbody')

                  if (thead || tbody) {
                    return
                  }

                  onClose()
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
                      <tr key={i} style={{ position: 'relative' }}>
                        <td
                          className={
                            (i === index?.[0] && 'highlight') ||
                            (i === index?.[0] - 1 && explanation && 'highlight')
                          }
                        >
                          {startIndex + i}
                        </td>
                        {Object.values(row).map((value, y) => (
                          <td
                            key={y}
                            className={
                              (y === index?.[1] &&
                                i === index?.[0] &&
                                `bordered ${explanation ? 'no-top' : ''} `) ||
                              (y === index?.[1] &&
                                i === index?.[0] - 1 &&
                                explanation &&
                                'bordered no-bot') ||
                              (y === index?.[1] && 'highlight') ||
                              (i === index?.[0] && 'highlight') ||
                              (i === index?.[0] - 1 && explanation && 'highlight')
                            }
                          >
                            {value}
                          </td>
                        ))}
                        {i === index?.[0] && explanation && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '-100%',
                              right: '100%',
                              bottom: 0,
                              display: 'flex',
                              alignItems: 'center',
                              width: '250px',
                              overflow: 'visible',
                              marginRight: '5px'
                            }}
                          >
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              style={{
                                width: '250px',
                                backgroundColor: 'black',
                                borderRadius: '8px',
                                zIndex: 999
                              }}
                            >
                              <Explanation explanation={explanation} />
                            </motion.div>
                          </div>
                        )}
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
