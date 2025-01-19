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

  const contentRef = useRef();

  const handlePrint = () => {
    const printContent = contentRef.current;
    const originalContent = document.body.innerHTML;

    // Remplace le contenu du document avec celui de la div à imprimer
    document.body.innerHTML = printContent.innerHTML;
    window.print();

    // Rétablit le contenu original après impression
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div ref={contentRef} id="content">
      <div id="button">
        <button onClick={handlePrint} style={{ marginTop: '20px' }}></button>
      </div>
      <InfoG />
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
