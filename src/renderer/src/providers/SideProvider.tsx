import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import SidePanel from '@renderer/generic/sidePanel'

const SideContext = createContext({
  openSide: () => {},
  closeSide: () => {}
})

export const useSideContext = () => useContext(SideContext)

const SideProvider = ({ children }) => {
  const [sideProps, setSideProps] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const closeSide = useCallback(() => {
    setIsOpen(false)
    setSideProps(null)
  }, [])

  const openSide = useCallback((props) => {
    setSideProps(props)
    setIsOpen(true)
  }, [])

  const value = useMemo(
    () => ({
      openSide,
      closeSide
    }),
    [openSide, closeSide]
  )

  return (
    <SideContext.Provider value={value}>
      {children}
      <SidePanel isOpen={isOpen} onClose={closeSide} {...(sideProps || {})} />
    </SideContext.Provider>
  )
}

export default SideProvider
