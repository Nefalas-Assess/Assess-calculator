import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Field from '@renderer/generic/field'
import Interest from '@renderer/generic/interet'
import Money from '@renderer/generic/money'

const ProvisionsForm = ({ initialValues, onSubmit, editable = true }) => {
  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: initialValues || {
      provisions: [{}]
    }
  })

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'provisions'
  })

  const formValues = watch()
  const provisionsValues = useWatch({
    control,
    name: 'provisions'
  })

  const previousValuesRef = useRef({})

  const submitForm = useCallback(
    (data) => {
      onSubmit(data)
    },
    [onSubmit]
  )

  useEffect(() => {
    const valuesChanged =
      JSON.stringify(formValues) !== JSON.stringify(previousValuesRef.current.formValues) ||
      JSON.stringify(provisionsValues) !== JSON.stringify(previousValuesRef.current?.provisions)

    if (valuesChanged) {
      previousValuesRef.current = {
        formValues,
        provisions: provisionsValues
      }

      handleSubmit(submitForm)()
    }
  }, [formValues, provisionsValues, submitForm, handleSubmit])

  const addNext = useCallback(
    (append, initial = {}) => {
      const lastRowEnd = formValues?.provisions?.[formValues?.provisions?.length - 1]?.end

      if (lastRowEnd) {
        const finDate = new Date(lastRowEnd)
        if (!isNaN(finDate)) {
          finDate.setDate(finDate.getDate() + 1)
          append({ start: finDate.toISOString().split('T')[0], ...initial })
        }
      } else {
        append({ ...initial })
      }
    },
    [formValues]
  )

  // Calcul des totaux pour Montant et Intérêts
  const totals = useMemo(() => {
    const totalAmount = provisionsValues.reduce(
      (acc, curr) => acc + (parseFloat(curr.amount) || 0),
      0
    )
    const totalInterest = provisionsValues.reduce((acc, curr) => {
      const interest =
        curr.date_provision && curr.date_paiement ? (
          <Interest
            amount={curr.amount || 0}
            start={curr.date_provision}
            end={curr.date_paiement}
          />
        ) : (
          0
        )
      return acc + parseFloat(interest)
    }, 0)

    return {
      totalAmount: totalAmount * -1,
      totalInterest: totalInterest * -1
    }
  }, [provisionsValues])

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Provisions</h1>
        <table style={{ width: 700 }}>
          <thead>
            <tr>
              <th>Date de provision</th>
              <th>Montant</th>
              <th className="int">Date du paiement</th>
              <th className="int">Intérêts (€)</th>
              {editable && <th></th>}
            </tr>
          </thead>
          <tbody>
            {fields.map((child, index) => {
              const values = formValues?.provisions[index]
              return (
                <tr key={child.id}>
                  <td>
                    <Field
                      control={control}
                      type="date"
                      name={`provisions.${index}.date_provision`}
                      editable={editable}
                    >
                      {(props) => <input {...props} />}
                    </Field>
                  </td>
                  <td>
                    <Field
                      control={control}
                      type="number"
                      name={`provisions.${index}.amount`}
                      editable={editable}
                    >
                      {(props) => <input {...props} />}
                    </Field>
                  </td>
                  <td className="int">
                    <Field
                      control={control}
                      type="date"
                      name={`provisions.${index}.date_paiement`}
                      editable={editable}
                    >
                      {(props) => <input {...props} />}
                    </Field>
                  </td>
                  <td className="int">
                    <Interest
                      amount={values?.amount || 0}
                      start={values?.date_provision}
                      end={values?.date_paiement}
                    />
                  </td>
                  {editable && (
                    <td>
                      <button type="button" onClick={() => remove(index)}>
                        Supprimer
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>

        {editable && (
          <button type="button" onClick={() => addNext(append, {})}>
            Ajouter provisions
          </button>
        )}
      </form>
      <div className="total-box">
        <strong>Total des provisions : </strong> <Money value={totals.totalAmount.toFixed(2)} />
      </div>
      <div className="total-box">
        <strong>Total des intérêts : </strong> <Money value={totals.totalInterest.toFixed(2)} />
      </div>
    </>
  )
}

export default ProvisionsForm
