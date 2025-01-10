import { intervalToDuration } from 'date-fns'
import React, { createContext, useCallback, useState } from 'react'

export const AppContext = createContext()

const AppProvider = ({ children }) => {
  const [data, setData] = useState(null)
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
    if (res?.general_info) {
      const { years: age_consolidation } = intervalToDuration({
        start: res?.general_info?.date_naissance,
        end: res?.general_info?.date_consolidation
      })
      res.computed_info = {
        age_consolidation
      }
    }
    return res
  }, [])

  const storeData = useCallback(
    (res) => {
      const result = computeData(res)

      setData((prev) => ({ ...prev, ...result }))
    },
    [computeData]
  )

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
        back: handleBackHome
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export default AppProvider
