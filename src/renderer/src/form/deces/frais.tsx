import { useCallback } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Field from '@renderer/generic/field'
import constants from '@renderer/constants'
import DynamicTable from '@renderer/generic/dynamicTable'
import TextItem from '@renderer/generic/textItem'
import useGeneralInfo from '@renderer/hooks/generalInfo'
import useAutosaveForm from '@renderer/hooks/autosaveForm'

const FraisFunForm = ({ initialValues, onSubmit, editable = true }) => {
  const generalInfo = useGeneralInfo()

  const { control, handleSubmit } = useForm({
    defaultValues: initialValues || {
      charges: [{}]
    }
  })

  const formValues = useWatch({ control })

  const submitForm = useCallback(
    (data) => {
      onSubmit(data) // Soumettre avec l'onSubmit passé en prop
    },
    [onSubmit]
  )

  useAutosaveForm({ values: formValues, handleSubmit, onSubmit: submitForm })

  const fraisColumns = [
    { header: 'common.frais', key: 'name', type: 'text' },
    { header: 'common.montant', key: 'amount', type: 'number' },
    {
      header: 'deces.frais.montant_ant',
      key: 'total',
      type: 'capitalization',
      props: {
        end: generalInfo?.date_death,
        base: 'data_ff',
        refArray: constants.interet_amount,
        ref: 'ref',
        index: 'rate'
      }
    }
  ]

  const notAnticipatedColumns = [
    { header: 'common.frais', key: 'name', type: 'text' },
    {
      header: 'common.montant',
      key: 'amount',
      type: 'number',
      additionalContent: (e) => (
        <div className="money" style={{ display: 'none' }}>
          {e?.amount}
        </div>
      )
    }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextItem tag="h1" path="nav.deces.frais" />
      <TextItem tag="h3" path="common.variables" />
      <table id="IPVariables">
        <tr>
          <TextItem tag="td" path="common.ref_table" className="table-ref-other" />
          <td className="table-ref-other">
            <Field control={control} type="reference" name={`ref`} editable={editable}></Field>
          </td>
        </tr>
        <tr>
          <td>
            <TextItem path="common.taux_interet" />
          </td>
          <td>
            <Field
              control={control}
              type="select"
              options={constants.interet_amount}
              name={`rate`}
              editable={editable}
            ></Field>
          </td>
        </tr>
      </table>
      <DynamicTable
        subtitle="deces.frais.frais_ant"
        columns={fraisColumns}
        control={control}
        name="charges"
        formValues={formValues}
        editable={editable}
        calculateTotal={(e) => e?.amount}
      />
      <DynamicTable
        subtitle="deces.frais.frais_non_ant"
        columns={notAnticipatedColumns}
        control={control}
        name="not_anticipated_charges"
        formValues={formValues}
        editable={editable}
        calculateTotal={(e) => e?.amount}
      />
    </form>
  )
}

export default FraisFunForm
