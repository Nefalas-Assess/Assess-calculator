import { useCallback } from 'react'
import Money from './money'
import { withDelay } from './delayContent'

export const TotalBox = ({ name, label, selector, value, documentRef, negative, calc }) => {
  const getTotalDisplayedOnPage = useCallback(() => {
    if (!documentRef && value) return value

    const list = documentRef?.current?.querySelectorAll(`.${selector || name || 'money'}`)
    let total = 0

    list?.forEach((e) => {
      const rawText = e.innerText

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
  }, [documentRef, name, value, calc])

  return (
    <div className="total-box">
      {label && <strong>{label}</strong>}
      <Money
        className={`total${name ? '-' + name : ''}`}
        value={negative ? -getTotalDisplayedOnPage() : getTotalDisplayedOnPage()}
        ignore
      />
    </div>
  )
}

export default withDelay(TotalBox)
