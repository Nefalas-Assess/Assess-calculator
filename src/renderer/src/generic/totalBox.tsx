import { useCallback } from 'react'
import Money from './money'

export const TotalBox = ({ name, label }) => {
  const getTotalDisplayedOnPage = useCallback(() => {
    const list = document.querySelectorAll(`.${name || 'money'}`)
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

    return total // Retourner la somme totale
  }, [document, name])

  return (
    <div className="total-box">
      {label && <strong>{label}</strong>}
      <Money value={getTotalDisplayedOnPage()} ignore />
    </div>
  )
}

export default TotalBox
