import { intervalToDuration } from 'date-fns'
import React, { createContext, useCallback, useState } from 'react'

export const AppContext = createContext()

const setDefaultValues = (obj: any, defaultValues: any): any => {
  // Create a deep copy to avoid mutating the original object
  const result = structuredClone(obj)

  // Recursively traverse object and set default values
  const setDefaults = (current: any, defaults: any): any => {
    // Skip if current is null/undefined or not an object
    if (!current || typeof current !== 'object') return current

    // Handle arrays by recursively checking each item
    if (Array.isArray(current)) {
      return current.map((item) => {
        const newItem = { ...item }
        Object.entries(defaults).forEach(([key, value]) => {
          if ((newItem[key] === undefined || newItem[key] === '') && key in defaults) {
            newItem[key] = value
          }
        })
        return newItem
      })
    }

    // Handle objects
    Object.entries(defaults).forEach(([key, value]) => {
      if (current[key] === undefined || current[key] === '') {
        // Set default if value doesn't exist or is empty string
        current[key] = value
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively set defaults for nested objects
        current[key] = setDefaults(current[key], value)
      }
    })

    return current
  }

  return setDefaults(result, defaultValues)
}

const AppProvider = ({ children }) => {
  const [data, setData] = useState(null)
  const [lg, setLg] = useState('fr')
  const [darkMode, setDarkMode] = useState(true)
  const [filePath, setFilePath] = useState(null)

  const handleSave = useCallback(async () => {
    try {
      await window.api.writeFile(filePath, JSON.stringify(data, null, 2))
    } catch (err) {
      console.error(err)
    }
  }, [filePath, data])

  const handleBackHome = useCallback(() => {
    handleSave()
    setFilePath(null)
    setData(null)
  }, [setFilePath, setData, handleSave])

  const computeData = useCallback((res) => {
    if (!res.computed_info) {
      res.computed_info = {}
    }

    if (res?.general_info) {
      const { years: age_consolidation = 0 } = intervalToDuration({
        start: res?.general_info?.date_naissance,
        end: res?.general_info?.date_consolidation
      })
      res.computed_info.age_consolidation = age_consolidation
      if (res?.general_info?.calcul_interets === 'true') {
        res.computed_info.rate = parseFloat(res?.general_info?.taux_int)
      }

      if (res?.general_info?.config?.default_contribution) {
        res.prejudice_proche = setDefaultValues(res?.prejudice_proche, {
          menage_contribution: res?.general_info?.config?.default_contribution
        })
        res.forfait_ip = setDefaultValues(res?.forfait_ip, {
          contribution_imp: res?.general_info?.config?.default_contribution
        })
        res.incapacite_perma_menage_cap = setDefaultValues(res?.incapacite_perma_menage_cap, {
          conso_contribution: res?.general_info?.config?.default_contribution,
          perso_contribution: res?.general_info?.config?.default_contribution
        })
        if ((res?.incapacite_temp_menagere?.periods || [])?.length !== 0) {
          res.incapacite_temp_menagere.periods = setDefaultValues(
            res?.incapacite_temp_menagere?.periods,
            {
              contribution: res?.general_info?.config?.default_contribution
            }
          )
        }
      }
    }

    return res
  }, [])

  const storeData = useCallback(
    (res) => {
      setData((prev) => computeData({ ...prev, ...res }))
    },
    [computeData]
  )

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode)
  }, [setDarkMode, darkMode])

  const resetData = useCallback(() => {
    setData(initial)
  }, [])

  // the value passed in here will be accessible anywhere in our application
  // you can pass any value, in our case we pass our state and it's update method
  return (
    <AppContext.Provider
      value={{
        data,
        setData: storeData,
        reset: resetData,
        filePath,
        setFilePath,
        save: handleSave,
        back: handleBackHome,
        toggleDarkMode,
        mode: darkMode ? 'dark' : 'light',
        lg,
        setLg
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export default AppProvider
