import { useEffect, useRef, useState } from 'react'
import TextItem from './textItem'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

const SIDE_OVERLAY_Z_INDEX = 4000
const SIDE_PANEL_Z_INDEX = SIDE_OVERLAY_Z_INDEX + 1
const SIDE_EXPLANATION_Z_INDEX = SIDE_PANEL_Z_INDEX + 1

const Explanation = ({ explanation }) => {
  return <div className="coef-explanation">{explanation}</div>
}

const SidePanel = ({
  isOpen,
  onClose,
  headers,
  index,
  table,
  startIndex = 0,
  explanation
}) => {
  const [explanationPos, setExplanationPos] = useState(null)
  const rowRefs = useRef([])
  const scrollableRef = useRef(null)

  const indexColumn = index?.[1]
  const indexRow = index?.[0]

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

  useEffect(() => {
    const scrollableElement = scrollableRef.current
    if (scrollableElement && explanation) {
      const handleScroll = () => {
        calculateExplanationPos()
      }

      scrollableElement.addEventListener('scroll', handleScroll)

      return () => {
        scrollableElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [explanation, isOpen, index])

  const modalRoot =
    typeof document !== 'undefined'
      ? document.querySelector('.app') || document.body
      : null

  if (!isOpen) return null

  return modalRoot
    ? createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
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
                  zIndex: SIDE_OVERLAY_Z_INDEX
                }}
                onClick={onClose}
              />

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
                  zIndex: SIDE_PANEL_Z_INDEX,
                  overflow: 'scroll'
                }}
                onClick={(e) => {
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
              {explanation && explanationPos && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    position: 'fixed',
                    top: explanationPos.top,
                    right: scrollableRef?.current?.clientWidth + 10,
                    backgroundColor: 'var(--tooltip-bg)',
                    color: 'var(--tooltip-text)',
                    borderRadius: 'var(--radius-md, 12px)',
                    border:
                      '1px solid color-mix(in srgb, var(--sidebar-link-indicator, var(--color-primary)) 55%, transparent)',
                    boxShadow: 'var(--shadow-soft)',
                    zIndex: SIDE_EXPLANATION_Z_INDEX,
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

export default SidePanel
