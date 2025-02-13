import { useContext } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import content from '@renderer/traduction'

/**
 * Récupère la traduction pour un chemin donné
 */
export const getTranslation = (path: string, lg: string): string => {
  const keys = path.split('.')
  let result: any = content

  for (const key of keys) {
    if (result[key] === undefined) {
      return path // Retourne le chemin si la traduction n'existe pas
    }
    result = result[key]
  }

  return result[lg] || path // Retourne la traduction ou le path si la langue n'existe pas
}

interface TextItemProps extends React.HTMLAttributes<HTMLElement> {
  path: string
  tag?: keyof JSX.IntrinsicElements // Permet d'utiliser n'importe quelle balise HTML (div, span, p, etc.)
}

/**
 * Composant de traduction
 */
export const TextItem = ({ path, tag: Tag = 'span', ...rest }: TextItemProps) => {
  const { lg } = useContext(AppContext)
  const translation = getTranslation(path, lg)

  return <Tag {...rest}>{translation}</Tag>
}

export default TextItem
