import AppProvider, { AppContext } from './providers/AppProvider'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import AppLayout from './layouts/AppLayout'
import EFFA from './components/effa'
import IP from './components/ip'
import ITM from './components/itm'
import ITP from './components/itp'
import INFOG from './components/infog'
import ITE from './components/ite'
import Home from './components/Home'
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
          <Route path="itm" element={<ITM />} />
          <Route path="itp" element={<ITP />} />
          <Route path="ite" element={<ITE />} />
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
