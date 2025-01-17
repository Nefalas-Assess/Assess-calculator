import AppProvider, { AppContext } from './providers/AppProvider'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import AppLayout from './layouts/AppLayout'
import INFOG from './components/infog'
import Home from './components/Home'
import IPForfait from './components/incapacite_permanente/forfait'
import IPPersonnel from './components/incapacite_permanente/personnel_cap'
import IPMenagère from './components/incapacite_permanente/menage_cap'
import IPFrais from './components/incapacite_permanente/frais_cap'
import IPEconomique from './components/incapacite_permanente/economique_cap'
import IPParticulier from './components/incapacite_permanente/particuliers'

import EFFA from './components/incapacite_temporaire/effa'
import HOSP from './components/incapacite_temporaire/hosp'
import PRETIUM from './components/incapacite_temporaire/pretium'
import Personnel from './components/incapacite_temporaire/personnel'
import Menagere from './components/incapacite_temporaire/menagere'
import Economique from './components/incapacite_temporaire/economique'
import FRAIS from './components/frais'
import FUNE from './components/fune'
import EXH from './components/exh'
import DMP from './components/dmp'
import { useContext } from 'react'

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

const Main = () => {
  const { filePath } = useContext(AppContext)

  if (!filePath) return <Home />

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<INFOG />} />
          <Route path="infog" element={<INFOG />} />
          <Route path="ip/*" element={<IncapacitePerma />} />
          <Route path="it/*" element={<IncapaciteTemp />} />
          <Route path="frais" element={<FRAIS />} />
          <Route path="fune" element={<FUNE />} />
          <Route path="exh" element={<EXH />} />
          <Route path="dmp" element={<DMP />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

function App(): JSX.Element {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  )
}

export default App
