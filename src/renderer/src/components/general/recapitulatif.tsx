import React, { useCallback, useContext, useRef } from 'react'
import InfoG from './infog'
import Frais from './frais'
import Personnel from '../incapacite_temporaire/personnel'
import Menagere from '../incapacite_temporaire/menagere'
import Economique from '../incapacite_temporaire/economique'
import EFFA from '../incapacite_temporaire/effa'
import Hospitalisation from '../incapacite_temporaire/hosp'
import PretiumDoloris from '../incapacite_temporaire/pretium'
import Forfait from '../incapacite_permanente/forfait'
import PersonnelCap from '../incapacite_permanente/personnel_cap'
import MenageCap from '../incapacite_permanente/menage_cap'
import EconomiqueCap from '../incapacite_permanente/economique_cap'
import FraisCap from '../incapacite_permanente/frais_cap'
import Particuliers from '../incapacite_permanente/particuliers'
import FraisFun from '../deces/frais_deces'
import PrejudiceEXH from '../deces/prejudice_exh'
import PrejudiceProche from '../deces/prejudice_proche'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'

const Recapitulatif = () => {
  const contentRef = useRef()

  const handlePrint = async () => {
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

    try {
      const absoluteLogoPath = `${await window.api.resolvePath('src/renderer/src/assets/icon-plain.png')}`
      window.api.print(content, styles, absoluteLogoPath)
    } catch (error) {
      console.error('Erreur lors de la résolution du chemin du logo:', error)
    }
  }

  return (
    <>
      <div id="top-menu">
        <button onClick={handlePrint} style={{ marginTop: '20px' }}>
          Imprimer
        </button>
      </div>
      <div ref={contentRef} id="content">
        <InfoG editable={false} />
        <Frais editable={false} />
        <Personnel editable={false} />
        <Menagere editable={false} />
        <Economique editable={false} />
        <EFFA editable={false} />
        <Hospitalisation editable={false} />
        <PretiumDoloris editable={false} />
        <Forfait editable={false} />
        <PersonnelCap editable={false} />
        <MenageCap editable={false} />
        <EconomiqueCap editable={false} />
        <FraisCap editable={false} />
        <Particuliers editable={false} />

        <FraisFun editable={false} />
        <PrejudiceEXH editable={false} />
        <PrejudiceProche editable={false} />
        <TotalBoxInterest
          selector="total-interest"
          documentRef={contentRef}
          label={'Total interet global'}
        />
        <TotalBox selector="total" documentRef={contentRef} label={'Total global'} />
      </div>
    </>
  )
}

export default Recapitulatif
