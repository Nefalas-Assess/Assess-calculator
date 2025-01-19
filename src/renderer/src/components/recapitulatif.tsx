import React, { useCallback, useContext } from 'react'
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
  return (
    <div id="content">
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
