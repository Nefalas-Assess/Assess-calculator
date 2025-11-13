import { useCallback, useContext } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import logo from '@renderer/assets/icon.png'
import TextItem from '@renderer/generic/textItem'
import { AppContext } from '@renderer/providers/AppProvider'
import { useToast } from '@renderer/providers/ToastProvider'
import { FaMoon, FaSun } from 'react-icons/fa6'

const HeaderLayout = () => {
  const { toggleDarkMode, mode, filePath, back, save, setLg, lg, data } = useContext(AppContext)
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSave = useCallback(() => {
    save()
    addToast('toast.file_saved')
  }, [save, addToast, data])

  const isHome = location?.pathname === '/'

  return (
    <div className={`app ${mode}`}>
      <div className="app-header">
        <div style={{ display: 'flex', alignItems: 'center' }} onClick={() => navigate('/')}>
          <img style={{ width: 40, marginRight: 10 }} src={logo} alt="Logo" />
        </div>
        <div className="right">
          <button
            type="button"
            className="header-icon-button"
            onClick={toggleDarkMode}
            aria-label={mode === 'dark' ? 'Basculer en mode clair' : 'Basculer en mode sombre'}
            title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {mode === 'dark' ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
            <span className="visually-hidden">
              <TextItem path={'layout.mode'} />
            </span>
          </button>
          {filePath && (
            <>
              <button type="button" onClick={handleSave}>
                <TextItem path={'layout.save'} />
              </button>
            </>
          )}
          {!isHome && (
            <button
              type="button"
              onClick={() => {
                navigate('/')
              }}
            >
              <TextItem path={'layout.home'} />
            </button>
          )}
          <button type="button" onClick={() => navigate('/settings')}>
            <TextItem path={'layout.settings'} />
          </button>
          <select className="select-lang" value={lg} onChange={(e) => setLg(e?.target?.value)}>
            <option value="fr">FR</option>
            <option value="nl">NL</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>
      <Outlet />
    </div>
  )
}

export default HeaderLayout
