import { AppContext } from '@renderer/providers/AppProvider'
import { useContext, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'

const LinkItem = ({ to, children }) => {
  return (
    <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={to}>
      {children}
    </NavLink>
  )
}

export const AppLayout = () => {
  const { data, save, back, toggleDarkMode, mode } = useContext(AppContext)

  const [incPerma, setIncPerma] = useState(false)
  const [incTemp, setIncTemp] = useState(false)
  const [dead, setDead] = useState(false)

  const location = useLocation() // Utilisé pour détecter l'URL actuelle

  // Mettre incTemp à true lors du chargement si une condition est remplie
  useEffect(() => {
    // Vérifie si l'URL actuelle correspond à une des routes enfants d'"Incapacités Temporaires"
    if (location.pathname.startsWith('/it')) {
      setIncTemp(true)
    }
    if (location.pathname.startsWith('/ip')) {
      setIncPerma(true)
    }
  }, [location.pathname]) // Réagir uniquement si le chemin change

  console.log(mode)

  return (
    <div className={`app ${mode}`}>
      <div className="app-layout">
        <div className="app-header">
          <div className="left">Assess</div>
          <div className="right">
            <button onClick={toggleDarkMode}>Toggle</button>
            <button onClick={save}>Sauvegarder</button>
            <button onClick={back}>Home</button>
          </div>
        </div>
        <div className="core">
          <div className="layout-menu">
            <LinkItem to="/infog">Informations générales</LinkItem>
            <LinkItem to="/frais">Frais</LinkItem>
            <div className="sub-nav">
              <div className="sub-nav-title" onClick={() => setIncTemp(!incTemp)}>
                Incapacités Temporaires
              </div>
              {incTemp && (
                <div>
                  <LinkItem to="/it/personnel">Personnelle</LinkItem>
                  <LinkItem to="/it/menagère">Ménagère</LinkItem>
                  <LinkItem to="/it/economique">Economique</LinkItem>
                  <LinkItem to="/it/effa">Efforts Accrus</LinkItem>
                  <LinkItem to="/it/hosp">Hospitalisation</LinkItem>
                  <LinkItem to="/it/pretium">Pretium Doloris</LinkItem>
                </div>
              )}
            </div>
            <div className="sub-nav">
              <div className="sub-nav-title" onClick={() => setIncPerma(!incPerma)}>
                Incapacités Permanentes
              </div>
              {incPerma && (
                <div>
                  <LinkItem to="/ip/forfait">Forfaitaires</LinkItem>
                  <LinkItem to="/ip/personnel">Personnelles capitalisées</LinkItem>
                  <LinkItem to="/ip/menagère">Ménagères capitalisées</LinkItem>
                  <LinkItem to="/ip/economique">Économiques capitalisées</LinkItem>
                  <LinkItem to="/ip/frais">Frais capitalisés</LinkItem>
                  <LinkItem to="/ip/particuliers">Préjudices Particuliers</LinkItem>
                </div>
              )}
            </div>
            <div className="sub-nav">
              <div className="sub-nav-title" onClick={() => setDead(!dead)}>
                Décès
              </div>
              {dead && (
                <div>
                  <LinkItem to="/fune">Frais funéraires</LinkItem>
                  <LinkItem to="/exh">Préjudice ex haerede</LinkItem>
                  <LinkItem to="/dmp">Préjudice des proches</LinkItem>
                </div>
              )}
            </div>
          </div>
          <div
            className={`content ${data?.general_info?.calcul_interets !== 'true' && 'contentWithOutInteret'}`}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
