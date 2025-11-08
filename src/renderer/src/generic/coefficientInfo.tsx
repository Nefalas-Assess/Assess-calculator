import { useEffect, useRef, useState } from 'react'
import TextItem from './textItem'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

const Explanation = ({ explanation }) => {
  return <div className="coef-explanation">{explanation}</div>
}

const Side = ({ isOpen, onClose, headers, index, table, startIndex = 0, explanation }) => {
  const [explanationPos, setExplanationPos] = useState(null)
  const rowRefs = useRef([])
  const scrollableRef = useRef(null)

  const indexColumn = index?.[1]
  const indexRow = index?.[0]

  // Function to calculate explanation position
  const calculateExplanationPos = () => {
    const rowIndex = indexRow < 0 ? 0 : indexRow

    if (isOpen && indexRow != null && rowRefs.current[rowIndex]) {
      const rowRect = rowRefs.current[rowIndex].getBoundingClientRect()
      setExplanationPos({
        top: rowRect.top
      })
    }
  }

  useEffect(() => {
    calculateExplanationPos()
  }, [isOpen, index])

  // Add scroll event listener
  useEffect(() => {
    const scrollableElement = scrollableRef.current
    if (scrollableElement && explanation) {
      const handleScroll = () => {
        calculateExplanationPos()
      }

      scrollableElement.addEventListener('scroll', handleScroll)

      // Cleanup function
      return () => {
        scrollableElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [explanation, isOpen, index])

  // Créer un élément DOM pour y attacher le portail
  const modalRoot =
    typeof document !== 'undefined' ? document.querySelector('.app') || document.body : null

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
                ref={scrollableRef}
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
                      <tr
                        key={i}
                        ref={(el) => (rowRefs.current[i] = el)}
                        style={{ position: 'relative' }}
                      >
                        <td
                          className={
                            (i === indexRow && 'highlight') ||
                            (i === indexRow + 1 && explanation && 'highlight')
                          }
                        >
                          {startIndex + i}
                        </td>
                        {Object.values(row).map((value, y) => (
                          <td
                            key={y}
                            className={
                              (y === indexColumn &&
                                i === indexRow &&
                                `bordered ${explanation ? 'no-bot' : ''} `) ||
                              (y === indexColumn &&
                                i === indexRow + 1 &&
                                explanation &&
                                'bordered no-top') ||
                              (y === indexColumn && 'highlight') ||
                              (i === indexRow && 'highlight') ||
                              (i === indexRow + 1 && explanation && 'highlight')
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
              {/* Explanation en dehors du conteneur scrollable */}
              {explanation && explanationPos && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    position: 'fixed',
                    top: explanationPos.top,
                    right: scrollableRef?.current?.clientWidth + 10, // adjust as needed
                    backgroundColor: 'var(--tooltip-bg)',
                    color: 'var(--tooltip-text)',
                    borderRadius: 'var(--radius-md, 12px)',
                    border:
                      '1px solid color-mix(in srgb, var(--sidebar-link-indicator, var(--color-primary)) 55%, transparent)',
                    boxShadow: 'var(--shadow-soft)',
                    zIndex: 1000,
                    transform: 'translateY(-50%)'
                  }}
                >
                  <Explanation explanation={explanation} />
                </motion.div>
              )}
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
