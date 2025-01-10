import { AppContext } from '@renderer/providers/AppProvider'
import { useContext } from 'react'
import { NavLink, Outlet } from 'react-router'

export const AppLayout = () => {
  const { data, save, back } = useContext(AppContext)

  return (
    <div className="app">
      <div className="app-layout">
        <div className="app-header">
          <div className="left">Ju Calculator</div>
          <div className="right">
            <button onClick={save}>Sauvegarder</button>
            <button onClick={back}>Home</button>
          </div>
        </div>
        <div className="core">
          {data && (
            <div className="layout-menu">
              <NavLink to="/infog">Informations générales</NavLink>
              <NavLink to="/itp">Incapacité Temporaire Personnelle</NavLink>
              <NavLink to="/itm">Incapacité Temporaire Ménagère</NavLink>
              <NavLink to="/ite">Incapacités Temporaires Économiques</NavLink>
              <NavLink to="/effa">Efforts Accrus</NavLink>
              <NavLink to="/ip">Incapacité Permanente</NavLink>
            </div>
          )}
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
