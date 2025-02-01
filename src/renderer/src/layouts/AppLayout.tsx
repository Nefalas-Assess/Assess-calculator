import { AppContext } from '@renderer/providers/AppProvider'
import { useToast } from '@renderer/providers/ToastProvider'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import logo from '@renderer/assets/icon.png'
import get from 'lodash/get'
import Tooltip from '@renderer/generic/tooltip'

const LinkItem = ({ to, children }) => {
  return (
    <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={to}>
      {children}
    </NavLink>
  )
}

const DetectMissingData = ({ children, data, required }) => {
  const missingData = useMemo(() => {
    const res = []
    for (let i = 0; i < (required || []).length; i += 1) {
      const item = required[i]
      if (!item?.value) return

      if (!get(data, item?.value)) {
        res.push(item)
      }
    }
    return res
  }, [data, required])

  const renderToolTipContent = useCallback(() => {
    return (
      <div>
        Certaines valeurs sont manquantes pour accéder a cette partie:
        <ul>
          {missingData?.map((it, key) => (
            <li key={key} style={{ listStyle: 'inside' }}>
              {it?.label}
            </li>
          ))}
        </ul>
      </div>
    )
  }, [missingData])

  if ((missingData || [])?.length === 0) return children

  return (
    <Tooltip
      tooltipContent={renderToolTipContent()}
      contentStyle={{ backgroundColor: 'red' }}
      style={{ width: '100%' }}
    >
      <div style={{ position: 'relative', marginTop: -5, marginBottom: -5, opacity: 0.6 }}>
        {children}
        <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }} />
      </div>
    </Tooltip>
  )
}

export const AppLayout = () => {
  const { data, save, back, toggleDarkMode, mode, filePath } = useContext(AppContext)

  const { addToast, removeToast } = useToast()

  const [incPerma, setIncPerma] = useState(false)
  const [incTemp, setIncTemp] = useState(false)
  const [dead, setDead] = useState(false)

  const navigate = useNavigate()
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
    if (location.pathname.startsWith('/deces')) {
      setDead(true)
    }
  }, [location.pathname]) // Réagir uniquement si le chemin change

  useEffect(() => {
    window.api.onUpdateAvailable(() => {
      addToast('Mise à jour trouvé. Téléchargement en cours ...', true, 'update-available')
    })

    window.api.onUpdateNotAvailable(() => {
      addToast("L'application est à jour")
    })

    window.api.onUpdateDownloaded(() => {
      removeToast('update-available')
      addToast('Mise à jour téléchargé', true, 'update-downloaded', {
        text: 'Redémarrer',
        action: () => window.api.restartApp()
      })
    })
  }, [addToast])

  const handleSave = useCallback(() => {
    save()
    addToast('Fichier sauvegardé')
  }, [save])

  useEffect(() => {
    if (filePath === null) {
      navigate('/', { replace: true })
    }
  }, [filePath, navigate])

  return (
    <div className={`app ${mode}`}>
      <div className="app-layout">
        <div className="app-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img style={{ width: 40, marginRight: 10 }} src={logo} alt="Logo" />
            <div style={{ color: '#8bbdff' }} className="left">
              Assess
            </div>
          </div>
          <div className="right">
            <button onClick={toggleDarkMode}>Mode</button>
            {filePath && (
              <>
                <button onClick={handleSave}>Sauvegarder</button>
                <button
                  onClick={() => {
                    back()
                  }}
                >
                  Accueil
                </button>
              </>
            )}
          </div>
        </div>
        <div className="core">
          <div className="layout-menu">
            {filePath && (
              <div className="menu">
                <LinkItem to="/infog">Informations générales</LinkItem>
                <DetectMissingData data={data} required={[]}>
                  <LinkItem to="/frais">Frais</LinkItem>
                </DetectMissingData>
                <div className="sub-nav">
                  <DetectMissingData
                    data={data}
                    required={[
                      { value: 'general_info.date_naissance', label: 'Date de naissance' },
                      { value: 'general_info.date_consolidation', label: 'Date de consolidation' },
                      { value: 'general_info.sexe', label: 'Sexe' }
                    ]}
                  >
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
                  </DetectMissingData>
                </div>
                <div className="sub-nav">
                  <DetectMissingData
                    data={data}
                    required={[
                      { value: 'general_info.date_naissance', label: 'Date de naissance' },
                      { value: 'general_info.date_consolidation', label: 'Date de consolidation' },
                      { value: 'general_info.sexe', label: 'Sexe' }
                    ]}
                  >
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
                  </DetectMissingData>
                </div>
                <div className="sub-nav">
                  <DetectMissingData
                    data={data}
                    required={[
                      { value: 'general_info.date_naissance', label: 'Date de naissance' },
                      { value: 'general_info.date_death', label: 'Date de décès' },
                      { value: 'general_info.sexe', label: 'Sexe' }
                    ]}
                  >
                    <div className="sub-nav-title" onClick={() => setDead(!dead)}>
                      Décès
                    </div>
                    {dead && (
                      <div>
                        <LinkItem to="/deces/frais">Frais funéraires</LinkItem>
                        <LinkItem to="/deces/prejudice_exh">Préjudice ex haerede</LinkItem>
                        <LinkItem to="/deces/prejudice_proche">Préjudice des proches</LinkItem>
                      </div>
                    )}
                  </DetectMissingData>
                </div>
                <div>
                  <LinkItem to="/provisions">Provisions</LinkItem>
                </div>
                <div>
                  <LinkItem to="/recap">Récapitulatif</LinkItem>
                </div>
              </div>
            )}
            <div className="menu-bottom">
              <button
                style={{ fontSize: 10, margin: 0 }}
                onClick={() => window.api.checkForUpdates()}
              >
                Recherche de mise a jour
              </button>
              <div style={{ padding: 5 }}>{import.meta.env.VITE_APP_VERSION}</div>
            </div>
          </div>
          <div
            className={`content ${data?.general_info?.calcul_interets !== 'true' && 'contentWithOutInteret'}`}
          >
            <div className={'scroll'}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
