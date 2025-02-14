import { useEffect, useState } from 'react'

const DelayedContent = ({ delay = 500, children }) => {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowContent(true)
    }, delay)

    return () => clearTimeout(timeout) // Nettoyage du timeout si le composant est démonté
  }, [delay])

  return showContent ? children : null
}

export const withDelay =
  (Component, delay = 500) =>
    (props) => {
      return (
        <DelayedContent delay={delay} contentRef={props.documentRef}>
          <Component {...props} />
        </DelayedContent>
      )
    }

export default DelayedContent
