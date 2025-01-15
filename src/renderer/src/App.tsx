import AppProvider, { AppContext } from './providers/AppProvider'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import AppLayout from './layouts/AppLayout'
import EFFA from './components/incapacite_temporaire/effa'
import IP from './components/ip'
import INFOG from './components/infog'
import Home from './components/Home'
import HOSP from './components/incapacite_temporaire/hosp'
import PRETIUM from './components/incapacite_temporaire/pretium'
import PART from './components/particuliers'
import FRAIS from './components/frais'
import IPPC from './components/incapacite_permanente/personnel_cap'
import IPMC from './components/ipmc'
import IPEC from './components/ipec'
import FUNE from './components/fune'
import EXH from './components/exh'
import DMP from './components/dmp'
import FC from './components/frais_cap'
import { useContext } from 'react'
import Personnel from './components/incapacite_temporaire/personnel'
import Menagere from './components/incapacite_temporaire/menagere'
import Economique from './components/incapacite_temporaire/economique'

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

const Main = () => {
  const { filePath } = useContext(AppContext)

  if (!filePath) return <Home />

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<INFOG />} />
          <Route path="infog" element={<INFOG />} />
          <Route path="ip" element={<IP />} />
          <Route path="it/*" element={<IncapaciteTemp />} />
          <Route path="particuliers" element={<PART />} />
          <Route path="frais" element={<FRAIS />} />
          <Route path="ippc" element={<IPPC />} />
          <Route path="ipmc" element={<IPMC />} />
          <Route path="ipec" element={<IPEC />} />
          <Route path="fune" element={<FUNE />} />
          <Route path="exh" element={<EXH />} />
          <Route path="dmp" element={<DMP />} />
          <Route path="frais_cap" element={<FC />} />
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
