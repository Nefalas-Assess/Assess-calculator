import React, { useCallback, useContext, useRef } from 'react'
import InfoG from './infog'
import Frais from './frais'
import Personnel from './incapacite_temporaire/personnel'
import Menagere from './incapacite_temporaire/menagere'
import Economique from './incapacite_temporaire/economique'
import EFFA from './incapacite_temporaire/effa'
import Hospitalisation from './incapacite_temporaire/hosp'
import PretiumDoloris from './incapacite_temporaire/pretium'
import Forfait from './incapacite_permanente/forfait'
import PersonnelCap from './incapacite_permanente/personnel_cap'
import MenageCap from './incapacite_permanente/menage_cap'
import EconomiqueCap from './incapacite_permanente/economique_cap'
import FraisCap from './incapacite_permanente/frais_cap'
import Particuliers from './incapacite_permanente/particuliers'

const Recapitulatif = () => {
  const contentRef = useRef()

  const handlePrint = () => {
    const content = contentRef.current.outerHTML

    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('')
        } catch (e) {
          console.error('Erreur lors du chargement des styles:', e)
          return ''
        }
      })
      .join('')

    // Envoyez un message au main process via IPC pour imprimer
    window.api.print(content, styles)
  }

  return (
    <div ref={contentRef} id="content">
      <div id="button">
        <button onClick={handlePrint} style={{ marginTop: '20px' }}></button>
      </div>
      <InfoG editable={false} />
      <Frais />
      <Personnel />
      <Menagere />
      <Economique />
      <EFFA />
      <Hospitalisation />
      <PretiumDoloris />
      <Forfait />
      <PersonnelCap />
      <MenageCap />
      <EconomiqueCap />
      <FraisCap />
      <Particuliers />
    </div>
  )
}

export default Recapitulatif
