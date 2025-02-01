// ToastContext.tsx
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Loader from '@renderer/generic/loader'

interface Toast {
  id: string
  message: string
}

interface ToastContextType {
  addToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const UpdateProgress = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Écouter l'événement 'download-progress'
    window.api.onDownloadProgress((event, progress) => {
      setProgress(progress.percent) // Mettre à jour la progression
    })

    // Nettoyer l'écouteur lors du démontage du composant
    return () => {
      window.api.onDownloadProgress(() => { }) // Supprimer l'écouteur
    }
  }, [])

  return (
    <div style={{ marginLeft: 10 }}>
      <progress value={progress} max="100" />
    </div>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const ToastContent = ({ item }) => {
  const [clicked, setClicked] = useState(false)

  return (
    <>
      {item.message}
      {item.action && (
        <button
          onClick={() => {
            setClicked(true)
            item.action.action()
          }}
          style={{
            margin: 0,
            marginLeft: '10px',
            background: 'black',
            color: 'white',
            border: 'none',
            padding: '6px 10px',
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {item.action.text}
            {clicked && (
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
      )}
    </>
  )
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (
      message: string,
      noTimeout?: boolean,
      id?: string,
      action?: { text: string; action: () => void }
    ) => {
      const generatedId = id || Math.random().toString(36).substring(2, 15)
      setToasts((prev) => [...prev, { id: generatedId, message, action }])

      if (!noTimeout) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== generatedId))
        }, 2000)
      }
    },
    []
  )

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: '70px',
          right: '0px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-end',
          flexDirection: 'column'
        }}
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring' }}
              style={{
                background: 'green',
                color: '#fff',
                padding: '10px 20px',
                borderTopLeftRadius: '5px',
                borderBottomLeftRadius: '5px',
                marginBottom: '10px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                right: '-100%'
              }}
            >
              <ToastContent item={toast} />
              {toast?.id === 'update-available' && <UpdateProgress />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
