import { getDays, getMedDate } from '@renderer/helpers/general'
import { format } from 'date-fns'
import { useCallback, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import { useCapitalization } from '@renderer/hooks/capitalization'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import FadeIn from '@renderer/generic/fadeIn'
import TextItem from '@renderer/generic/textItem'
import CoefficientInfo from '@renderer/generic/coefficientInfo'
import SalaryBasis from '@renderer/generic/salaryBasis'
import useGeneralInfo from '@renderer/hooks/generalInfo'
import { resolveSalaryInfo } from '@renderer/helpers/getSalaryInfo'
import getIndicativeAmount from '@renderer/helpers/getIndicativeAmount'
import useAutosaveForm from '@renderer/hooks/autosaveForm'

const salaryBasisOptions = [
  { value: 'brut', label: 'common.salary_yearly_brut' },
  { value: 'net', label: 'common.salary_yearly_net' }
]

const CapAmount = ({ values, type = 'net', ignore = false }) => {
  const generalInfo = useGeneralInfo()

  const index = constants?.interet_amount?.findIndex(
    (e) => e?.value === parseFloat(values?.interet || 0)
  )

  const coef = useCapitalization({
    end: values?.paiement,
    ref: values?.reference,
    index,
    asObject: true
  })

  const getCapAmount = useCallback(
    (currentValues) => {
      const { amount = 0 } = currentValues || {}
      const pourcentage = generalInfo?.ip?.economique?.interet

      return {
        tooltip: (
          <div>
            <math>
              <mn>{parseFloat(amount)}</mn>
              <mo>x</mo>
              <mfrac>
                <mn>{pourcentage}</mn>
                <mn>100</mn>
              </mfrac>
              <mo>x</mo>
              <CoefficientInfo headers={constants?.interet_amount} {...coef?.info}>
                <mn>{coef?.value}</mn>
              </CoefficientInfo>
            </math>
          </div>
        ),
        value: (
          parseFloat(amount) *
          (parseFloat(pourcentage) / 100) *
          parseFloat(coef?.value)
        ).toFixed(2)
      }
    },
    [coef, generalInfo]
  )

  return (
    <Money
      value={getCapAmount(values?.[type])?.value}
      tooltip={getCapAmount(values?.[type])?.tooltip}
      ignore={ignore}
    />
  )
}

export const IPEcoCapForm = ({ onSubmit, initialValues, editable = true }) => {
  const generalInfo = useGeneralInfo()

  const yearlyNetSalary = getIndicativeAmount(generalInfo?.economique?.net?.yearly, 0)
  const yearlyBrutSalary = getIndicativeAmount(generalInfo?.economique?.brut?.yearly, 0)

  const { handleSubmit, control, register, setValue } = useForm({
    defaultValues: {
      paiement: generalInfo?.config?.date_paiement,
      salary_basis: 'brut',
      salary_basis_period: 'brut',
      ...(initialValues || {})
    }
  })

  const formValues = useWatch({ control })
  const selectedSalaryBasis = formValues?.salary_basis || 'brut'
  const selectedPeriodSalaryBasis = formValues?.salary_basis_period || 'brut'

  const submitForm = (values) => {
    onSubmit(values)
  }

  useAutosaveForm({ values: formValues, handleSubmit, onSubmit: submitForm })

  const days = useMemo(
    () => ({
      brut: getDays({
        start: generalInfo?.date_consolidation,
        end: formValues?.paiement
      }),
      net: getDays({
        start: generalInfo?.date_consolidation,
        end: formValues?.paiement
      })
    }),
    [formValues?.paiement, generalInfo]
  )

  const getConsoAmount = useCallback(
    (values, name) => {
      const { conso_amount } = values || {}
      const numDays = days[name || 'brut']
      const { amount, divisor } = resolveSalaryInfo(
        conso_amount,
        generalInfo?.economique?.[name || 'brut']
      )
      const consoPourcentage = generalInfo?.ip?.economique?.interet

      return (
        parseInt(numDays || 0, 10) *
        (parseFloat(amount || 0) / divisor) *
        (parseFloat(consoPourcentage || 0) / 100)
      ).toFixed(2)
    },
    [days, generalInfo]
  )

  const renderToolTipConso = useCallback(
    (values, name) => {
      const { conso_amount } = values || {}
      const numDays = days[name || 'brut']
      const { amount, divisor } = resolveSalaryInfo(
        conso_amount,
        generalInfo?.economique?.[name || 'net']
      )
      const consoPourcentage = generalInfo?.ip?.economique?.interet

      return (
        <div>
          <math>
            <mn>{numDays}</mn>
            <mo>x</mo>
            <mfrac>
              <mn>{amount}</mn>
              <mn>{divisor}</mn>
            </mfrac>
            <mo>x</mo>
            <mfrac>
              <mn>{consoPourcentage}</mn>
              <mn>100</mn>
            </mfrac>
          </math>
        </div>
      )
    },
    [days, generalInfo]
  )

  const renderPeriodTable = useCallback(
    (option, isSelected = true) => {
      const isBrut = option.value === 'brut'

      return (
        <table id="ippcTable" style={{ maxWidth: 1200 }}>
          <thead>
            <tr>
              <th style={{ width: 50 }}>%</th>
              <TextItem path={'common.date_consolidation'} tag="th" />
              <TextItem path={'common.date_paiement'} tag="th" />
              <TextItem path={'common.days'} tag="th" />
              <TextItem
                path={isBrut ? 'common.salary_yearly_brut' : 'common.salary_yearly_net'}
                tag="th"
              />
              <TextItem path={isBrut ? 'common.total_brut' : 'common.total_net'} tag="th" />
              <TextItem path="common.interest" tag="th" className="int" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{generalInfo?.ip?.economique?.interet}</td>
              <td>
                {generalInfo?.date_consolidation &&
                  format(generalInfo?.date_consolidation, 'dd/MM/yyyy')}
              </td>
              <td>{formValues?.paiement && format(formValues?.paiement, 'dd/MM/yyyy')}</td>
              <td style={{ width: 50 }}>{days?.[option.value] || 0}</td>
              <td>
                <Field
                  control={control}
                  name={`${option.value}.conso_amount`}
                  editable={editable}
                  type="salary"
                  salaryType={option.value}
                />
              </td>
              <td>
                <Money
                  value={getConsoAmount(formValues?.[option.value], option.value)}
                  tooltip={renderToolTipConso(formValues?.[option.value], option.value)}
                  ignore={!isSelected}
                />
              </td>
              <td className="int">
                <Interest
                  amount={getConsoAmount(formValues?.[option.value], option.value)}
                  start={getMedDate({
                    start: generalInfo?.date_consolidation,
                    end: formValues?.paiement
                  })}
                  end={formValues?.paiement}
                  ignore={!isSelected}
                />
              </td>
            </tr>
          </tbody>
        </table>
      )
    },
    [control, days, editable, formValues, generalInfo, getConsoAmount, renderToolTipConso]
  )

  const renderAnnualTable = useCallback(
    (option, isSelected = true) => {
      const isBrut = option.value === 'brut'

      return (
        <table id="itebTable" style={{ maxWidth: 1200 }}>
          <thead>
            <tr>
              <th style={{ width: 50 }}>%</th>
              <TextItem path={option.label} tag="th" />
              <TextItem path={'common.total'} tag="th" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{generalInfo?.ip?.economique?.interet}</td>
              <td>
                <Money value={isBrut ? yearlyBrutSalary : yearlyNetSalary} ignore span />
              </td>
              <td>
                <CapAmount
                  values={{
                    ...formValues,
                    [option.value]: {
                      amount: isBrut ? yearlyBrutSalary : yearlyNetSalary
                    }
                  }}
                  type={option.value}
                  ignore={!isSelected}
                />
              </td>
            </tr>
          </tbody>
        </table>
      )
    },
    [formValues, generalInfo, yearlyBrutSalary, yearlyNetSalary]
  )

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <input type="hidden" {...register('salary_basis')} />
      <input type="hidden" {...register('salary_basis_period')} />
      <TextItem path={'incapacite_perma.eco_cap.title'} tag="h1" />
      <TextItem path={'common.variables_cap'} tag="h3" />
      <table id="IPVariables">
        <tbody>
          <tr>
            <TextItem path={'common.ref_table'} tag="td" />
            <td>
              <Field
                control={control}
                type="reference"
                options={constants.reference}
                name={`reference`}
                editable={editable}
              ></Field>
            </td>
          </tr>
          <tr>
            <TextItem path={'common.taux_interet_capitalisation'} tag="td" />
            <td>
              <Field
                control={control}
                type="select"
                options={constants.interet_amount}
                name={`interet`}
                editable={editable}
              ></Field>
            </td>
          </tr>
          <tr>
            <TextItem path={'common.date_paiement'} tag="td" />
            <td>
              <Field control={control} type="date" name={`paiement`} editable={editable}>
                {(props) => <input {...props} />}
              </Field>
            </td>
          </tr>
        </tbody>
      </table>
      <FadeIn show={formValues?.paiement && formValues?.reference && formValues?.interet}>
        <TextItem path={'common.period_consolidation_payment'} tag="h3" />
        <SalaryBasis
          editable={editable}
          options={salaryBasisOptions}
          selectedValue={selectedPeriodSalaryBasis}
          onSelect={(value) =>
            setValue('salary_basis_period', value, {
              shouldDirty: true,
              shouldTouch: true
            })
          }
          labelPath="incapacite_perma.eco_cap.salary_basis_period"
          variant="vertical"
          sideLabel
          renderOption={(option, isSelected) => renderPeriodTable(option, isSelected)}
          renderReadonly={(option) => renderPeriodTable(option)}
        />

        <TextItem path={'incapacite_perma.eco_cap.title_eco'} tag="h3" />
        <SalaryBasis
          editable={editable}
          options={salaryBasisOptions}
          selectedValue={selectedSalaryBasis}
          onSelect={(value) =>
            setValue('salary_basis', value, {
              shouldDirty: true,
              shouldTouch: true
            })
          }
          labelPath="incapacite_perma.eco_cap.salary_basis"
          renderOption={(option, isSelected) => renderAnnualTable(option, isSelected)}
          renderReadonly={(option) => renderAnnualTable(option)}
        />
      </FadeIn>
    </form>
  )
}

export default IPEcoCapForm
