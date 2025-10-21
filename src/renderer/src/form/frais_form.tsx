import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import Money from '@renderer/generic/money'
import Interest from '@renderer/generic/interet'
import TotalBox from '@renderer/generic/totalBox'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import DynamicTable from '@renderer/generic/dynamicTable'
import TextItem from '@renderer/generic/textItem'
import useGeneralInfo from '@renderer/hooks/generalInfo'

export const FraisForm = ({ onSubmit, initialValues, editable = true }) => {
  const generalInfo = useGeneralInfo()

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      frais: [
        {
          date_paiement: generalInfo?.config?.date_paiement
        }
      ],
      administratif_value: '100',
      vestimentaire_value: '400',
      deplacement_value: 0,
      // By default véhicule automobile
      deplacement_type: 0.42
    }
  })

  const formValues = watch()

  // Fonction pour calculer le total des frais
  const totalSumFrais = useMemo(() => {
    return formValues?.frais
      ?.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)
      .toFixed(2)
  }, [formValues])

  const totalDeplacementFrais = useMemo(
    () => ({
      value: (formValues?.deplacement_value * formValues?.deplacement_type).toFixed(2),
      tooltip: (
        <math>
          <mn>{formValues?.deplacement_value}</mn>
          <mo>x</mo>
          <mn>{formValues?.deplacement_type}</mn>
        </math>
      )
    }),
    [formValues]
  )

  const totalSumRest = useMemo(() => {
    return (
      parseFloat(totalDeplacementFrais?.value || 0) +
      parseFloat(formValues?.administratif_value || 0) +
      parseFloat(formValues?.vestimentaire_value || 0) +
      parseFloat(formValues?.package_value || 0)
    ).toFixed(2)
  }, [formValues, totalDeplacementFrais])

  const totalAides = useMemo(
    () => ({
      value: (parseFloat(formValues?.aides || 0) * 11.5).toFixed(2),
      tooltip: (
        <math>
          <mn>{formValues?.aides}</mn>
          <mo>x</mo>
          <mn>11.5</mn>
        </math>
      )
    }),
    [formValues]
  )

  const fraisValues = useWatch({
    control,
    name: 'frais'
  })

  // Référence pour suivre les anciennes valeurs
  const previousValuesRef = useRef({})

  const submitForm = useCallback(
    (data) => {
      onSubmit(data) // Soumettre avec l'onSubmit passé en prop
    },
    [onSubmit]
  )

  useEffect(() => {
    const valuesChanged =
      JSON.stringify(formValues) !== JSON.stringify(previousValuesRef.current.formValues) ||
      JSON.stringify(fraisValues) !== JSON.stringify(previousValuesRef.current?.frais)

    // Si des valeurs ont changé, soumettre le formulaire
    if (valuesChanged) {
      // Éviter de soumettre si aucune modification réelle
      previousValuesRef.current = {
        formValues,
        frais: fraisValues
      }

      handleSubmit(submitForm)() // Soumet le formulaire uniquement si nécessaire
    }
  }, [formValues, fraisValues, submitForm, handleSubmit])

  const columns = [
    { header: 'frais.indemnite_frais', key: 'indemnite', type: 'text' },
    { header: 'frais.facture_number', key: 'facture', type: 'text' },
    {
      header: 'common.paid',
      key: 'paid',
      type: 'select',
      options: constants.boolean,
      width: 50
    },
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
      <div className="total-box">
        <TextItem path="frais.total_frais_medicaux" tag="strong" /> <Money value={totalSumFrais} />
      </div>

      <table id="ipTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <TextItem path="frais.indemnite_frais" tag="th" />
            <th></th>
            <th></th>
            <TextItem path="common.paid" tag="th" />
            <TextItem path="common.total" tag="th" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <TextItem path="frais.administratif_value" tag="td" />
            <td></td>
            <td></td>
            <td>
              <Field
                control={control}
                type="select"
                options={constants.boolean}
                name={`administratif_paid`}
                editable={editable}
              ></Field>
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
          </tr>
          <tr>
            <TextItem path="frais.vestimentaire_value" tag="td" />
            <td></td>
            <td></td>
            <td>
              <Field
                control={control}
                type="select"
                options={constants.boolean}
                name={`vestimentaire_paid`}
                editable={editable}
              ></Field>
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
          </tr>
          <tr>
            <TextItem path="frais.deplacement_value" tag="td" />
            <td>
              <Field control={control} type="number" name={`deplacement_value`} editable={editable}>
                {(props) => (
                  <>
                    <input {...props} /> KM
                  </>
                )}
              </Field>
            </td>
            <td>
              <Field
                control={control}
                type="select"
                options={constants.deplacement_type}
                name={`deplacement_type`}
                editable={editable}
              ></Field>
            </td>
            <td>
              <Field
                control={control}
                type="select"
                options={constants.boolean}
                name={`deplacement_paid`}
                editable={editable}
              ></Field>
            </td>
            <td>
              <Money
                value={totalDeplacementFrais?.value}
                tooltip={totalDeplacementFrais?.tooltip}
                ignore
              />
            </td>
          </tr>
          <tr>
            <TextItem path="frais.package_value" tag="td" />
            <td></td>
            <td></td>
            <td>
              <Field
                control={control}
                type="select"
                options={constants.boolean}
                name={`package_paid`}
                editable={editable}
              ></Field>
            </td>
            <td>
              <Field control={control} type="number" name={`package_value`} editable={editable}>
                {(props) => (
                  <>
                    <input {...props} />
                  </>
                )}
              </Field>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="total-box">
        <TextItem path="frais.total_frais" tag="strong" /> <Money value={totalSumRest} />
      </div>

      <TextItem path="frais.aides_non_qualifies" tag="h1" />
      <table id="hospTable" style={{ maxWidth: 1200 }}>
        <thead>
          <tr>
            <TextItem path="frais.number_hours" tag="th" />
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
              <Money value={totalAides?.value} tooltip={totalAides?.tooltip} />
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  )
}

export default FraisForm
