import { AppContext } from '@renderer/providers/AppProvider'
import { useContext, useState } from 'react'
import { NavLink, Outlet } from 'react-router'

export const AppLayout = () => {
  const { data, save, back } = useContext(AppContext)

  const [incPerma, setIncPerma] = useState(false)
  const [incTemp, setIncTemp] = useState(false)
  const [Dead, setDead] = useState(false)

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
            <div className="sub-nav">
              <div className="sub-nav-title" onClick={() => setIncTemp(!incTemp)}>
                Incapacités Temporaires
              </div>
              {incTemp && (
                <div>
                  <NavLink to="/it">Incapacités Temporaires</NavLink>
                  <NavLink to="/effa">Efforts Accrus</NavLink>
                  <NavLink to="/hosp">Hospitalisation</NavLink>
                  <NavLink to="/pretium">Pretium Doloris</NavLink>
                </div>
              )}
            </div>
            <div className="sub-nav">
              <div className="sub-nav-title" onClick={() => setIncPerma(!incPerma)}>
                Incapacités Permanentes
              </div>
              {incPerma && (
                <div>
                  <NavLink to="/ip">Forfaitaires</NavLink>
                  <NavLink to="/ippc">Personnelles capitalisées</NavLink>
                  <NavLink to="/ipmc">Ménagères capitalisées</NavLink>
                  <NavLink to="/ipec">Économiques capitalisées</NavLink>
                  <NavLink to="/frais_cap">Frais capitalisés</NavLink>
                  <NavLink to="/particuliers">Préjudices Particuliers</NavLink>
                </div>
              )}
            </div>
            <div className="sub-nav">
              <div className="sub-nav-title" onClick={() => setDead(!Dead)}>
                Décès
              </div>
              {Dead && (
                <div>
                  <NavLink to="/fune">Frais funéraires</NavLink>
                  <NavLink to="/exh">Préjudice ex haerede</NavLink>
                  <NavLink to="/dmp">Préjudice des proches</NavLink>
                </div>
              )}
            </div>
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
