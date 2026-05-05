import { ReactNode } from 'react'
import TextItem from './textItem'

type SalaryBasisOption = {
  value: string
  label: string
}

type SalaryBasisProps = {
  editable?: boolean
  options: SalaryBasisOption[]
  selectedValue?: string
  onSelect: (value: string) => void
  labelPath: string
  renderOption: (option: SalaryBasisOption, isSelected: boolean) => ReactNode
  renderReadonly: (option: SalaryBasisOption) => ReactNode
  variant?: 'horizontal' | 'vertical'
  sideLabel?: boolean
}

const SalaryBasis = ({
  editable = true,
  options,
  selectedValue,
  onSelect,
  labelPath,
  renderOption,
  renderReadonly,
  variant = 'horizontal',
  sideLabel = false
}: SalaryBasisProps) => {
  const selectedOption = options.find((option) => option.value === selectedValue) || options?.[0]

  if (!selectedOption) return null

  if (!editable) {
    return renderReadonly(selectedOption)
  }

  return (
    <div
      className={`salary-basis-grid ${
        variant === 'vertical' ? 'salary-basis-grid--vertical' : ''
      } salary-basis-grid--${selectedOption.value}`}
    >
      {options.map((option) => {
        const isSelected = selectedOption.value === option.value

        return (
          <div
            key={option.value}
            role="button"
            tabIndex={0}
            className={`salary-basis-card ${isSelected ? 'is-selected' : 'is-muted'}`}
            onClick={() => onSelect(option.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(option.value)
              }
            }}
          >
            {renderOption(option, isSelected)}
          </div>
        )
      })}
      <div className={`salary-basis-footer ${sideLabel ? 'salary-basis-footer--side' : ''}`}>
        <div className="salary-basis-footer__label">
          <TextItem path={labelPath} tag="span" />
        </div>
      </div>
    </div>
  )
}

export default SalaryBasis
