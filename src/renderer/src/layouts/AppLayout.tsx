import { AppContext } from '@renderer/providers/AppProvider'
import { useContext, useState } from 'react'
import { NavLink, Outlet } from 'react-router'

export const AppLayout = () => {
  const { data, save, back } = useContext(AppContext)

  const [incPerma, setIncPerma] = useState(false)

  return (
    <div className="app">
      <div className="app-layout">
        <div className="app-header">
          <div className="left">Assess</div>
          <div className="right">
            <button onClick={save}>Sauvegarder</button>
            <button onClick={back}>Home</button>
          </div>
        </div>
        <div className="core">
          <div className="layout-menu">
            <NavLink to="/infog">Informations générales</NavLink>
            <NavLink to="/frais">Frais</NavLink>
            <NavLink to="/it">Incapacités Temporaires</NavLink>
            <NavLink to="/effa">Efforts Accrus</NavLink>
            <NavLink to="/hosp">Hospitalisation</NavLink>
            <NavLink to="/pretium">Pretium Doloris</NavLink>
            <div className="sub-nav">
              <div className="sub-nav-title" onClick={() => setIncPerma(!incPerma)}>
                Incapacités Permanentes
              </div>
              {incPerma && (
                <div>
                  <NavLink to="/ip">Forfaitaires</NavLink>
                  <NavLink to="/ippc">Personnelles CAP</NavLink>
                  <NavLink to="/ipmc">Ménagères CAP</NavLink>
                  <NavLink to="/ipec">Économiques CAP</NavLink>
                </div>
              )}
            </div>
            <NavLink to="/particuliers">Préjudices Particuliers</NavLink>
            <NavLink to="/fune">Frais funéraires</NavLink>
            <NavLink to="/exh">Préjudice ex haerede</NavLink>
            <NavLink to="/dmp">Préjudice des proches</NavLink>
          </div>
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
