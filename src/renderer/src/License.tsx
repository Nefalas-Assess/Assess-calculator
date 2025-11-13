import { useCallback, useEffect, useState } from 'react'
import Loader from './generic/loader'

const LicenseInput = ({ onChange }) => {
  const [licenseKey, setLicenseKey] = useState('')
  // Fonction pour formater la saisie
  const formatLicenseKey = (input) => {
    // Supprimer les tirets existants
    const cleanedInput = input.replace(/-/g, '')

    // Limiter à 20 caractères
    const truncatedInput = cleanedInput.slice(0, 20)

    // Ajouter un tiret tous les 4 caractères
    let formattedInput = ''
    for (let i = 0; i < truncatedInput.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedInput += '-'
      }
      formattedInput += truncatedInput[i]
    }

    return formattedInput
  }

  // Gérer le changement de valeur
  const handleInputChange = (e) => {
    const formattedValue = formatLicenseKey(e.target.value)
    setLicenseKey(formattedValue)
    onChange(e.target.value?.replaceAll('-', ''))
  }

  // Valider le format lors de la perte de focus
  const handleBlur = () => {
    if (!licenseKey) return
    const regex = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/
    if (!regex.test(licenseKey)) {
      alert('Le code de licence doit être au format XXXX-XXXX-XXXX-XXXX-XXXX.')
    }
  }

  return (
    <input
      type="text"
      id="licenseKey"
      value={licenseKey}
      onChange={handleInputChange}
      onBlur={handleBlur}
      placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
      maxLength={24} // 20 caractères + 4 tirets
      style={{
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ccc',
        textAlign: 'center',
        borderRadius: '5px',
        width: '300px'
      }}
    />
  )
}

export const License = ({ children }) => {
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError] = useState(null)
  const [valid, setValid] = useState<boolean | 'waiting'>('waiting')
  const [loading, setLoading] = useState(null)

  const checkLicense = useCallback(async () => {
    const storedKey = await window.api.getStore('license')
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (storedKey?.key) {
      const result = await window.api.checkLicense(storedKey?.key)

      if (result.valid) {
        setValid(result.valid)
      } else {
        setValid(false)
      }
    } else {
      setValid(false)
    }
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    // Simuler un délai de 2 secondes
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const result = await window.api.checkLicense(licenseKey)
    if (result.valid) {
      setValid(true)
    } else {
      setError(result?.error)
    }
    setLoading(false)
  }

  const renderError = useCallback((code) => {
    if (code === 'cap_devices') return 'Nombre de devices maximum atteint pour cette license'
    if (code === 'invalid_key') return 'Clé invalide'
    if (code === 'error_update') return 'Oups! Une erreur est survenue'
    if (code === 'too_many_attempts') return 'Trop de tentative!'
    if (code === 'expired') return 'La licence a expiré'
    return code?.toString()
  }, [])

  useEffect(() => {
    checkLicense()
  }, [])

  if (valid === 'waiting')
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Loader style={{ width: 100, height: 100 }} />
      </div>
    )

  if (valid) return children

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          height: '100%',
          flexDirection: 'column'
        }}
      >
        <h1>Validation de licence / Licentievalidatie / Licence validation</h1>
        <LicenseInput onChange={(e) => setLicenseKey(e)} />
        {error && (
          <div style={{ fontSize: 14, color: 'red', marginTop: 5 }}>{renderError(error)}</div>
        )}
        <button onClick={() => handleSubmit(licenseKey)}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            Valider
            {loading && (
              <Loader
                style={{
                  width: 30,
                  height: 30,
                  marginTop: -15,
                  marginBottom: -15,
                  marginRight: -5
                }}
              />
            )}
          </div>
        </button>
      </div>
    </div>
  )
}

export default License
