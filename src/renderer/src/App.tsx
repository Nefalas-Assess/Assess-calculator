import AppProvider, { AppContext } from './providers/AppProvider'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import AppLayout from './layouts/AppLayout'
import EFFA from './components/effa'
import IP from './components/ip'
import INFOG from './components/infog'
import Home from './components/Home'
import HOSP from './components/hosp'
import PRETIUM from './components/pretium'
import PART from './components/particuliers'
import FRAIS from './components/frais'
import IPPC from './components/ippc'
import IPMC from './components/ipmc'
import IPEC from './components/ipec'
import FUNE from './components/fune'
import EXH from './components/exh'
import IT from './components/it'
import DMP from './components/dmp'
import { useContext } from 'react'

// const ProtectedRoute = ({ children }) => {
//   const { filePath } = useContext(AppContext)

//   if (!filePath) {
//     // Si aucun fichier n'est importé, redirigez vers la page d'accueil
//     return <Navigate to="/" replace />
//   }

//   // Sinon, affichez les composants enfants
//   return children
// }

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
          <Route path="effa" element={<EFFA />} />
          <Route path="it" element={<IT />} />
          <Route path="hosp" element={<HOSP />} />
          <Route path="pretium" element={<PRETIUM />} />
          <Route path="particuliers" element={<PART />} />
          <Route path="frais" element={<FRAIS />} />
          <Route path="ippc" element={<IPPC />} />
          <Route path="ipmc" element={<IPMC />} />
          <Route path="ipec" element={<IPEC />} />
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
