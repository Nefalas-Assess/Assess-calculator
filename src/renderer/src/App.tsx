import AppProvider, { AppContext } from './providers/AppProvider'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import AppLayout from './layouts/AppLayout'
import Home from '@renderer/components/Home'
import IPForfait from '@renderer/components/incapacite_permanente/forfait'
import IPPersonnel from '@renderer/components/incapacite_permanente/personnel_cap'
import IPMenagère from '@renderer/components/incapacite_permanente/menage_cap'
import IPFrais from '@renderer/components/incapacite_permanente/frais_cap'
import IPEconomique from '@renderer/components/incapacite_permanente/economique_cap'
import IPParticulier from '@renderer/components/incapacite_permanente/particuliers'

import EFFA from '@renderer/components/incapacite_temporaire/effa'
import HOSP from '@renderer/components/incapacite_temporaire/hosp'
import PRETIUM from '@renderer/components/incapacite_temporaire/pretium'
import Personnel from '@renderer/components/incapacite_temporaire/personnel'
import Menagere from '@renderer/components/incapacite_temporaire/menagere'
import Economique from '@renderer/components/incapacite_temporaire/economique'
import INFOG from '@renderer/components/general/infog'
import FRAIS from '@renderer/components/general/frais'
import Provisions from '@renderer/components/general/provisions'
import Recapitulatif from '@renderer/components/general/recapitulatif'
import FraisFun from '@renderer/components/deces/frais_deces'
import PrejudiceEXH from '@renderer/components/deces/prejudice_exh'
import PrejudiceProche from '@renderer/components/deces/prejudice_proche'
import { useCallback, useContext, useEffect, useState } from 'react'
import ToastProvider from './providers/ToastProvider'
import License from './License'

const IncapaciteTemp = () => {
  return (
    <Routes>
      <Route path="/personnel" element={<Personnel />} />
      <Route path="/menagère" element={<Menagere />} />
      <Route path="/economique" element={<Economique />} />
      <Route path="/hosp" element={<HOSP />} />
      <Route path="/pretium" element={<PRETIUM />} />
      <Route path="/effa" element={<EFFA />} />
    </Routes>
  )
}

const IncapacitePerma = () => {
  return (
    <Routes>
      <Route path="/personnel" element={<IPPersonnel />} />
      <Route path="/menagère" element={<IPMenagère />} />
      <Route path="/economique" element={<IPEconomique />} />
      <Route path="/frais" element={<IPFrais />} />
      <Route path="/particuliers" element={<IPParticulier />} />
      <Route path="/forfait" element={<IPForfait />} />
    </Routes>
  )
}

const Deces = () => {
  return (
    <Routes>
      <Route path="/frais" element={<FraisFun />} />
      <Route path="/prejudice_exh" element={<PrejudiceEXH />} />
      <Route path="/prejudice_proche" element={<PrejudiceProche />} />
    </Routes>
  )
}

const Main = () => {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="infog" element={<INFOG />} />
          <Route path="ip/*" element={<IncapacitePerma />} />
          <Route path="it/*" element={<IncapaciteTemp />} />
          <Route path="deces/*" element={<Deces />} />
          <Route path="frais" element={<FRAIS />} />
          <Route path="provisions" element={<Provisions />} />
          <Route path="recap" element={<Recapitulatif />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

function App(): JSX.Element {
  return (
    <License>
      <ToastProvider>
        <AppProvider>
          <Main />
        </AppProvider>
      </ToastProvider>
    </License>
  )
}

export default App
