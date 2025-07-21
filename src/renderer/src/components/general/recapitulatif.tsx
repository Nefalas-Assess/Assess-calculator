import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import InfoG from './infog'
import Frais from './frais'
import Personnel from '../incapacite_temporaire/personnel'
import Menagere from '../incapacite_temporaire/menagere'
import Economique from '../incapacite_temporaire/economique'
import Effa from '../incapacite_temporaire/effa'
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
import DelayedContent from '@renderer/generic/delayContent'
import { AppContext } from '@renderer/providers/AppProvider'
import TextItem from '@renderer/generic/textItem'
import Provisions from './provisions'

const Recapitulatif = () => {
  const { data } = useContext(AppContext)

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
          <TextItem path="recapitulatif.print" />
        </button>
      </div>
      <div ref={contentRef} id="recap">
        {data?.general_info && <InfoG editable={false} />}
        {data?.frais && <Frais editable={false} />}
        {data?.incapacite_temp_personnel && <Personnel editable={false} />}
        {data?.incapacite_temp_menagere && <Menagere editable={false} />}
        {data?.incapacite_temp_economique && <Economique editable={false} />}
        {data?.efforts_accrus && <Effa editable={false} />}
        {data?.hospitalisation && <Hospitalisation editable={false} />}
        {data?.pretium_doloris && <PretiumDoloris editable={false} />}
        {data?.forfait_ip && <Forfait editable={false} />}
        {data?.incapacite_perma_personnel_cap && <PersonnelCap editable={false} />}
        {data?.incapacite_perma_menage_cap && <MenageCap editable={false} />}
        {data?.incapacite_perma_economique_cap && <EconomiqueCap editable={false} />}
        {data?.incapacite_perma_charges && <FraisCap editable={false} />}
        {data?.prejudice_particulier && <Particuliers editable={false} />}

        {data?.frais_funeraire && <FraisFun editable={false} />}
        {data?.prejudice_exh && <PrejudiceEXH editable={false} />}
        {data?.prejudice_proche && <PrejudiceProche editable={false} />} 
        {data?.provisions && <Provisions editable={false} />}

        <DelayedContent delay={1000}>
          <div style={{ padding: '0 20px 20px' }}>
            <TotalBoxInterest
              selector="total-interest"
              documentRef={contentRef}
              label="recapitulatif.total_interest"
            />
            <TotalBox selector="total" documentRef={contentRef} label="recapitulatif.total" />
          </div>
        </DelayedContent>
      </div>
    </>
  )
}

export default Recapitulatif
