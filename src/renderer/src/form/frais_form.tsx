import { useCallback, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import DynamicTable from '@renderer/generic/dynamicTable'
import TextItem from '@renderer/generic/textItem'
import useGeneralInfo from '@renderer/hooks/generalInfo'
import getIndicativeAmount from '@renderer/helpers/getIndicativeAmount'
import useAutosaveForm from '@renderer/hooks/autosaveForm'
import Interest from '@renderer/generic/interet'
import Tooltip from '@renderer/generic/tooltip'
import { FaRegQuestionCircle } from 'react-icons/fa'

export const FraisForm = ({ onSubmit, initialValues, editable = true }) => {
  const generalInfo = useGeneralInfo()

  const indicativeAmountAuto = getIndicativeAmount(generalInfo?.config?.km_vehicule, 0.42)
  const indicativeAmountOther = getIndicativeAmount(generalInfo?.config?.km_other, 0.28)

  const { control, handleSubmit } = useForm({
    defaultValues: initialValues || {
      frais: [
        {
          date_paiement: generalInfo?.config?.date_paiement
        }
      ],
      administratif_value: '100',
      administratif_date_paiement: generalInfo?.config?.date_paiement,
      vestimentaire_value: '400',
      vestimentaire_date_paiement: generalInfo?.config?.date_paiement
    }
  })

  const formValues = useWatch({ control })

  // Fonction pour calculer le total des frais
  const totalSumFrais = useMemo(() => {
    return formValues?.frais
      ?.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)
      .toFixed(2)
  }, [formValues])

  const getDeplacementRowTotal = useCallback(
    (val) => {
      return (
        parseInt(val?.distance, 10) *
        (val?.type === 'auto' ? indicativeAmountAuto : indicativeAmountOther)
      ).toFixed(2)
    },
    [indicativeAmountAuto, indicativeAmountOther]
  )

  const totalDeplacementFrais = useMemo(() => {
    const totalDistance = formValues?.travel.reduce((total, deplacement) => {
      return parseFloat(total) + parseFloat(getDeplacementRowTotal(deplacement))
    }, 0)

    return totalDistance
  }, [formValues, getDeplacementRowTotal])

  const totalSumRest = useMemo(() => {
    return (
      parseFloat(totalDeplacementFrais || 0) +
      parseFloat(formValues?.administratif_value || 0) +
      parseFloat(formValues?.vestimentaire_value || 0) +
      parseFloat(formValues?.package_value || 0)
    ).toFixed(2)
  }, [formValues, totalDeplacementFrais])

  const totalAides = useMemo(
    () => ({
      value: parseFloat(formValues?.aides || 0) * 11.5 + parseFloat(formValues?.aide_forfait || 0),
      tooltip: (
        <math>
          <mn>{formValues?.aide_forfait}</mn>
          <mo>+</mo>
          <mn>{formValues?.aides || 0}</mn>
          <mo>x</mo>
          <mn>11.5</mn>
        </math>
      )
    }),
    [formValues]
  )

  const accidentDate = generalInfo?.date_accident
  const defaultPaymentDate = generalInfo?.config?.date_paiement
  const administratifPaymentDate = formValues?.administratif_date_paiement || defaultPaymentDate
  const vestimentairePaymentDate = formValues?.vestimentaire_date_paiement || defaultPaymentDate

  const packageColumns = useMemo(
    () => [
      {
        header: 'common.amount',
        key: 'amount',
        type: 'number',
        additionalContent: (rowData) => (
          <div className="hide">
            <Money value={rowData?.amount} />
          </div>
        )
      },
      {
        header: 'common.label',
        key: 'label',
        type: 'text'
      }
    ],
    []
  )

  const deplacementColumns = useMemo(
    () => [
      {
        header: 'common.date',
        key: 'date',
        type: 'date'
      },
      {
        header: 'frais.deplacement_distance',
        key: 'distance',
        type: 'number',
        additionalContent: () => <span>KM</span>
      },
      {
        header: 'frais.deplacement_type',
        key: 'type',
        type: 'select',
        options: constants.deplacement_type
      },
      {
        header: 'common.total',
        key: 'total',
        type: 'calculated',
        tooltipContent: (rowData) => (
          <math>
            <mn>{rowData?.distance}</mn>
            <mo>x</mo>
            <mn>{rowData?.type === 'auto' ? indicativeAmountAuto : indicativeAmountOther}</mn>
          </math>
        ),
        additionalContent: (rowData) => (
          <div className="hide">
            <Money value={getDeplacementRowTotal(rowData)} />
          </div>
        )
      },
      {
        header: 'common.date_paiement',
        key: 'date_paiement',
        type: 'date',
        className: 'int'
      },
      {
        header: 'common.interest',
        key: 'interest',
        type: 'interest',
        className: 'int',
        props: {
          startKey: 'date'
        }
      }
    ],
    [getDeplacementRowTotal, indicativeAmountAuto, indicativeAmountOther]
  )

  const submitForm = useCallback(
    (data) => {
      onSubmit(data) // Soumettre avec l'onSubmit passé en prop
    },
    [onSubmit]
  )

  useAutosaveForm({ values: formValues, handleSubmit, onSubmit: submitForm })

  const columns = [
    { header: 'frais.indemnite_frais', key: 'indemnite', type: 'text' },
    { header: 'frais.facture_number', key: 'facture', type: 'text' },
    ...(editable
      ? [
          {
            header: 'common.paid',
            key: 'paid',
            columnInfo: 'frais.paid_info',
            type: 'select',
            options: constants.boolean,
            width: 80
          }
        ]
      : []),
    {
      header: 'common.amount',
      key: 'amount',
      type: 'number',
      props: { step: '0.01' }
    },
    {
      header: 'frais.date_frais',
      key: 'date_frais',
      type: 'start',
      className: 'int'
    },
    {
      header: 'common.date_paiement',
      key: 'date_paiement',
      type: 'end',
      className: 'int'
    },
    {
      header: 'common.interest',
      key: 'interest',
      type: 'interest',
      className: 'int'
    }
  ]

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <DynamicTable
        title="frais.frais_medicaux"
        columns={columns}
        control={control}
        name="frais"
        formValues={formValues}
        editable={editable}
        addRowDefaults={{
          coefficient: 5,
          date_paiement: generalInfo?.config?.date_paiement
        }}
        calculateTotal={(e) => e.amount}
      />
      {!editable && parseFloat(totalSumFrais || 0) === 0 ? null : (
        <div className="total-box">
          <TextItem path="frais.total_frais_medicaux" tag="strong" />
          <Money value={totalSumFrais} />
        </div>
      )}

      <table id="ipTable" style={{ maxWidth: 900 }}>
        <thead>
          <tr>
            <TextItem path="frais.indemnite_frais" tag="th" />
            <TextItem path="common.date_paiement" tag="th" />
            <TextItem path="common.total" tag="th" className="int" />
            <TextItem path="common.interest" tag="th" className="int" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <TextItem path="frais.administratif_value" />
              <Tooltip tooltipContent={<span>[€ 50 - € 150]</span>}>
                <FaRegQuestionCircle style={{ marginLeft: '5px' }} />
              </Tooltip>
            </td>
            <td>
              <Field
                control={control}
                type="date"
                name="administratif_date_paiement"
                editable={editable}
              >
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td>
              <Field
                control={control}
                type="number"
                name={`administratif_value`}
                editable={editable}
              >
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td className="int">
              <Interest
                amount={formValues?.administratif_value}
                start={accidentDate}
                end={administratifPaymentDate}
              />
            </td>
          </tr>
          <tr>
            <td>
              <TextItem path="frais.vestimentaire_value" />
              <Tooltip tooltipContent={<span>[€ 400]</span>}>
                <FaRegQuestionCircle style={{ marginLeft: '5px' }} />
              </Tooltip>
            </td>
            <td>
              <Field
                control={control}
                type="date"
                name="vestimentaire_date_paiement"
                editable={editable}
              >
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td>
              <Field
                control={control}
                type="number"
                name={`vestimentaire_value`}
                editable={editable}
              >
                {(props) => <input {...props} />}
              </Field>
            </td>
            <td className="int">
              <Interest
                amount={formValues?.vestimentaire_value}
                start={accidentDate}
                end={vestimentairePaymentDate}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <DynamicTable
        subtitle="frais.deplacement_value"
        columns={deplacementColumns}
        control={control}
        name="travel"
        formValues={formValues}
        editable={editable}
        calculateTotal={(rowData) => getDeplacementRowTotal(rowData)}
        addRowDefaults={{
          date_paiement: generalInfo?.config?.date_paiement,
          type: 'auto',
          distance: 0
        }}
      />

      <DynamicTable
        subtitle="frais.package_value"
        columns={packageColumns}
        control={control}
        name="package"
        formValues={formValues}
        editable={editable}
        calculateTotal={(rowData) => rowData?.amount}
      />

      <div className="total-box">
        <TextItem path="frais.total_frais" tag="strong" /> <Money value={totalSumRest} />
      </div>

      {!editable && (!formValues?.aides || formValues?.aides === 0) ? (
        <></>
      ) : (
        <>
          <TextItem path="frais.aides_non_qualifies" tag="h1" />
          <table id="hospTable" style={{ maxWidth: 1200 }}>
            <thead>
              <tr>
                <TextItem path="frais.number_hours" tag="th" />
                <TextItem path="common.forfait" tag="th" />
                <TextItem path="common.total" tag="th" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Field control={control} type="number" name={`aides`} editable={editable}>
                    {(props) => <input min={0} {...props} />}
                  </Field>
                </td>
                <td>
                  <Field control={control} type="number" name={`aide_forfait`} editable={editable}>
                    {(props) => <input {...props} />}
                  </Field>
                </td>
                <td>
                  <Money value={totalAides?.value} tooltip={totalAides?.tooltip} />
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </form>
  )
}

export default FraisForm
