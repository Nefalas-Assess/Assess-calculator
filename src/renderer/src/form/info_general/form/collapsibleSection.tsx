import type { ReactNode } from 'react'
import TextItem from '@renderer/generic/textItem'

type CollapsibleSectionProps = {
  title: string
  children: ReactNode
}

const CollapsibleSection = ({ title, children }: CollapsibleSectionProps) => (
  <details className="info-collapsible-section">
    <summary className="info-collapsible-section__summary">
      <TextItem path={title} />
      <span className="info-collapsible-section__chevron" aria-hidden="true" />
    </summary>
    <div className="info-collapsible-section__content">{children}</div>
  </details>
)

export default CollapsibleSection
