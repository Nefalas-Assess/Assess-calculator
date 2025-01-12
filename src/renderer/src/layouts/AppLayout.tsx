import { AppContext } from '@renderer/providers/AppProvider'
import { useContext } from 'react'
import { NavLink, Outlet } from 'react-router'

export const AppLayout = () => {
  const { data, save, back } = useContext(AppContext)

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
            <NavLink to="/itp">Incapacités Temporaires Personnelles</NavLink>
            <NavLink to="/itm">Incapacités Temporaires Ménagères</NavLink>
            <NavLink to="/ite">Incapacités Temporaires Économiques</NavLink>
            <NavLink to="/effa">Efforts Accrus</NavLink>
            <NavLink to="/hosp">Hospitalisation</NavLink>
            <NavLink to="/pretium">Pretium Doloris</NavLink>
            <NavLink to="/ip">Incapacités Permanentes Forfaitaires</NavLink>
            <NavLink to="/ippc">Incapacités Permanentes Personnelles CAP</NavLink>
            <NavLink to="/ipmc">Incapacités Permanentes Ménagères CAP</NavLink>
            <NavLink to="/ipec">Incapacités Permanentes Économiques CAP</NavLink>
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
