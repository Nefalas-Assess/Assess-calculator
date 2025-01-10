import AppProvider from './providers/AppProvider'
import { HashRouter, Route, Routes } from 'react-router'
import AppLayout from './layouts/AppLayout'
import EFFA from './components/effa'
import IP from './components/ip'
import ITM from './components/itm'
import ITP from './components/itp'
import INFOG from './components/infog'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<INFOG />} />
            <Route path="infog" element={<INFOG />} />
            <Route path="ip" element={<IP />} />
            <Route path="effa" element={<EFFA />} />
            <Route path="itm" element={<ITM />} />
            <Route path="itp" element={<ITP />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}

export default App
