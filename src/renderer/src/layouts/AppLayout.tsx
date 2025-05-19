import { AppContext } from '@renderer/providers/AppProvider'
import { useToast } from '@renderer/providers/ToastProvider'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import logo from '@renderer/assets/icon.png'
import get from 'lodash/get'
import Tooltip from '@renderer/generic/tooltip'
import Loader from '@renderer/generic/loader'
import { RecentFilesList } from '@renderer/generic/recentFilesList'
import { useRecentFiles } from '@renderer/hooks/recentFiles'
import TextItem from '@renderer/generic/textItem'

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
        <TextItem path={'nav.missing_data'} />
        <ul>
          {missingData?.map((it, key) => (
            <li key={key} style={{ listStyle: 'inside' }}>
              <TextItem path={it?.label} />
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
  const { data, save, back, toggleDarkMode, mode, filePath, setLg } = useContext(AppContext)

  const { addToast, removeToast } = useToast()

  const [incPerma, setIncPerma] = useState(false)
  const [incTemp, setIncTemp] = useState(false)
  const [dead, setDead] = useState(false)

  const [updateCheck, setUpdateCheck] = useState(false)

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
      addToast('Mise à jour trouvée. Téléchargement en cours', true, 'update-available')
      setUpdateCheck(false)
    })

    window.api.onUpdateNotAvailable(() => {
      addToast("L'application est à jour")
      setUpdateCheck(false)
    })

    window.api.onUpdateDownloaded(() => {
      removeToast('update-available')
      addToast('Mise à jour téléchargée', true, 'update-downloaded', {
        text: 'Redémarrer',
        action: () => window.api.restartApp()
      })
    })
  }, [addToast])

  const handleSave = useCallback(() => {
    save()
    addToast('Fichier sauvegardé')
  }, [save, data])

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
            <div style={{ color: '#395dff' }} className="left">
              Evalix
            </div>
          </div>
          <div className="right">
            <button onClick={toggleDarkMode}>
              <TextItem path={'layout.mode'} />
            </button>
            {filePath && (
              <>
                <button onClick={handleSave}>
                  <TextItem path={'layout.save'} />
                </button>
                <button
                  onClick={() => {
                    back()
                  }}
                >
                  <TextItem path={'layout.home'} />
                </button>
              </>
            )}
            <select className="select-lang" onChange={(e) => setLg(e?.target?.value)}>
              <option value="fr">FR</option>
              <option value="nl">NL</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
        <div className="core">
          <div className="layout-menu">
            {filePath ? (
              <div className="menu">
                <LinkItem to="/infog">
                  <TextItem path={'nav.info_general'} />
                </LinkItem>
                <DetectMissingData data={data} required={[]}>
                  <LinkItem to="/frais">
                    <TextItem path={'nav.frais'} />
                  </LinkItem>
                </DetectMissingData>
                <div className="sub-nav">
                  <DetectMissingData
                    data={data}
                    required={[
                      { value: 'general_info.date_naissance', label: 'common.date_naissance' },
                      { value: 'general_info.sexe', label: 'common.sexe' }
                    ]}
                  >
                    <div className="sub-nav-title" onClick={() => setIncTemp(!incTemp)}>
                      <TextItem path={'nav.incapacite_temp'} />
                    </div>
                    {incTemp && (
                      <div>
                        <LinkItem to="/it/personnel">
                          <TextItem path={'nav.incapacite_temp.personnel'} />
                        </LinkItem>
                        <LinkItem to="/it/menagère">
                          <TextItem path={'nav.incapacite_temp.menagère'} />
                        </LinkItem>
                        <LinkItem to="/it/economique">
                          <TextItem path={'nav.incapacite_temp.economique'} />
                        </LinkItem>
                        <LinkItem to="/it/effa">
                          <TextItem path={'nav.incapacite_temp.effa'} />
                        </LinkItem>
                        <LinkItem to="/it/hosp">
                          <TextItem path={'nav.incapacite_temp.hospitalisation'} />
                        </LinkItem>
                        <LinkItem to="/it/pretium">
                          <TextItem path={'nav.incapacite_temp.pretium'} />
                        </LinkItem>
                      </div>
                    )}
                  </DetectMissingData>
                </div>
                <div className="sub-nav">
                  <DetectMissingData
                    data={data}
                    required={[
                      { value: 'general_info.date_naissance', label: 'common.date_naissance' },
                      {
                        value: 'general_info.date_consolidation',
                        label: 'common.date_consolidation'
                      },
                      { value: 'general_info.sexe', label: 'common.sexe' }
                    ]}
                  >
                    <div className="sub-nav-title" onClick={() => setIncPerma(!incPerma)}>
                      <TextItem path={'nav.incapacite_perma'} />
                    </div>
                    {incPerma && (
                      <div>
                        <LinkItem to="/ip/forfait">
                          <TextItem path={'nav.incapacite_perma.forfait'} />
                        </LinkItem>
                        <LinkItem to="/ip/personnel">
                          <TextItem path={'nav.incapacite_perma.personnel_cap'} />
                        </LinkItem>
                        <LinkItem to="/ip/menagère">
                          <TextItem path={'nav.incapacite_perma.menagère_cap'} />
                        </LinkItem>
                        <LinkItem to="/ip/economique">
                          <TextItem path={'nav.incapacite_perma.economique_cap'} />
                        </LinkItem>
                        <LinkItem to="/ip/frais">
                          <TextItem path={'nav.incapacite_perma.frais_futurs'} />
                        </LinkItem>
                        <LinkItem to="/ip/particuliers">
                          <TextItem path={'nav.incapacite_perma.préjudices_part'} />
                        </LinkItem>
                      </div>
                    )}
                  </DetectMissingData>
                </div>
                <div className="sub-nav">
                  <DetectMissingData
                    data={data}
                    required={[
                      { value: 'general_info.date_naissance', label: 'common.date_naissance' },
                      { value: 'general_info.date_death', label: 'common.date_death' },
                      { value: 'general_info.sexe', label: 'common.sexe' }
                    ]}
                  >
                    <div className="sub-nav-title" onClick={() => setDead(!dead)}>
                      <TextItem path={'nav.deces'} />
                    </div>
                    {dead && (
                      <div>
                        <LinkItem to="/deces/frais">
                          <TextItem path={'nav.deces.frais'} />
                        </LinkItem>
                        <LinkItem to="/deces/prejudice_exh">
                          <TextItem path={'nav.deces.prejudice_exh'} />
                        </LinkItem>
                        <LinkItem to="/deces/prejudice_proche">
                          <TextItem path={'nav.deces.prejudice_proche'} />
                        </LinkItem>
                      </div>
                    )}
                  </DetectMissingData>
                </div>
                <div>
                  <LinkItem to="/provisions">
                    <TextItem path={'nav.provisions'} />
                  </LinkItem>
                </div>
                <div>
                  <LinkItem to="/recap">
                    <TextItem path={'nav.recap'} />
                  </LinkItem>
                </div>
              </div>
            ) : (
              <RecentFilesList />
            )}
            <div className="menu-bottom">
              <button
                style={{ fontSize: 10, margin: 0 }}
                onClick={() => {
                  setUpdateCheck(true)
                  window.api.checkForUpdates()
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <TextItem path={'layout.maj'} />
                  {updateCheck && (
                    <Loader
                      style={{
                        width: 20,
                        height: 20,
                        marginTop: -10,
                        marginBottom: -10,
                        marginRight: -5
                      }}
                    />
                  )}
                </div>
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
