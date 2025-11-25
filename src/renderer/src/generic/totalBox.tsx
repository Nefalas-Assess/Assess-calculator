import { useCallback, useEffect, useState } from 'react'
import Money from './money'
import { withDelay } from './delayContent'
import TextItem from './textItem'

export const TotalBox = ({ name, label, selector, value, documentRef, negative, calc }) => {
  const [recalcTrigger, setRecalcTrigger] = useState(0)

  const getTotalDisplayedOnPage = useCallback(() => {
    if (!documentRef && value) return value

    const list = documentRef?.current?.querySelectorAll(`.${selector || name || 'money'}`)
    let total = 0

    list?.forEach((e) => {
      // Skip elements that are inside a tooltip container
      let rawText = e.innerText

      // Get only text that is not inside tooltip-content class
      const tooltipContent = e.querySelector('.tooltip-container')
      if (tooltipContent) {
        rawText = rawText.replace(tooltipContent.innerText, '')
      }

      // Nettoyer le texte : supprimer les espaces, remplacer les virgules par des points, et retirer les symboles non numériques
      const cleanedText = rawText
        .replace(/\s/g, '') // Supprime les espaces
        .replace(',', '.') // Remplace la virgule par un point
        .replace(/[^0-9.-]/g, '') // Supprime tout ce qui n'est pas chiffre, point, ou tiret

      const value = parseFloat(cleanedText)

      if (!isNaN(value)) {
        // Vérifier que c'est un nombre valide
        total += value
      }
    })

    if (calc) return calc(total)

    return total // Retourner la somme totale
  }, [documentRef, name, value, calc, selector])

  // Observer DOM changes to trigger recalculation
  useEffect(() => {
    if (!documentRef?.current) return

    const observer = new MutationObserver((mutations) => {
      let shouldRecalc = false

      mutations.forEach((mutation) => {
        // Check if nodes were added or removed
        if (mutation.type === 'childList') {
          // Check if any added nodes contain money elements
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (element.querySelector?.('.money') || element.classList?.contains('money')) {
                shouldRecalc = true
              }
            }
          })

          // Check if any removed nodes contained money elements
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (element.querySelector?.('.money') || element.classList?.contains('money')) {
                shouldRecalc = true
              }
            }
          })
        }
        // Check if text content of money elements changed
        else if (mutation.type === 'characterData' || mutation.type === 'attributes') {
          const target = mutation.target as Element
          if (target.closest?.('.money')) {
            shouldRecalc = true
          }
        }
      })

      if (shouldRecalc) {
        // Small delay to ensure DOM is fully updated, then force component re-render
        setTimeout(() => {
          setRecalcTrigger((prev) => prev + 1)
        }, 50)
      }
    })

    observer.observe(documentRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: false
    })

    return () => observer.disconnect()
  }, [documentRef])

  return (
    <div className="total-box">
      {label && <TextItem tag="strong" path={label} />}
      <Money
        className={`total${name ? '-' + name : ''}`}
        value={negative ? -getTotalDisplayedOnPage() : getTotalDisplayedOnPage()}
        ignore={true}
        span={undefined}
        tooltip={undefined}
      />
    </div>
  )
}

export default withDelay(TotalBox)
