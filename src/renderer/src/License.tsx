import { useCallback, useEffect, useState } from 'react'

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
    // const regex = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/
    // if (!regex.test(licenseKey)) {
    //   alert('Le code de licence doit être au format XXXX-XXXX-XXXX-XXXX-XXXX.')
    // }
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
  const [valid, setValid] = useState(localStorage.getItem('licenseKey') ? true : false)

  const checkLicense = useCallback(async () => {
    const storedKey = localStorage.getItem('licenseKey')
    if (storedKey) {
      const result = await window.api.checkLicense(storedKey)

      if (result.valid) {
        setValid(result.valid)
      } else {
        setValid(false)
      }
    }
  }, [])

  const handleSubmit = async () => {
    console.log(licenseKey)
    const result = await window.api.checkLicense(licenseKey)
    if (result.valid) {
      localStorage.setItem('licenseKey', licenseKey)
      console.log('✅ Licence validée et stockée')
    } else {
      console.log('❌ Clé invalide')
    }
  }

  useEffect(() => {
    checkLicense()
  }, [])

  // if (valid) return children

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
        <h1>Validation de Licence</h1>
        <LicenseInput onChange={(e) => setLicenseKey(e)} />
        <button onClick={() => handleSubmit(licenseKey)}>Valider</button>
      </div>
    </div>
  )
}

export default License
