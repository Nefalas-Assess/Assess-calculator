import { useCallback } from 'react'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import InfoForm from '@renderer/form/info_general/form'
import TextItem, { useTranslation } from '@renderer/generic/textItem'

const InfoG = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()
  const translate = useTranslation()

  const saveData = useCallback(
    (values) => {
      const previousPaymentDate = data?.general_info?.config?.date_paiement
      const nextPaymentDate = values?.config?.date_paiement
      const paymentDateChanged =
        previousPaymentDate && previousPaymentDate !== nextPaymentDate

      const replaceDefaultPaymentDate = paymentDateChanged
        ? window.confirm(translate('info_general.default_payment_date_update_confirm'))
        : false

      setData(
        { general_info: values },
        {
          setDefault: true,
          ...(replaceDefaultPaymentDate
            ? {
                replaceDefaultPaymentDate: {
                  from: previousPaymentDate,
                  to: nextPaymentDate
                }
              }
            : {})
        }
      )
    },
    [data?.general_info?.config?.date_paiement, setData, translate]
  )

  return (
    <div id="content">
      <div id="main">
        <TextItem path="nav.info_general" tag="h1" />
        <InfoForm onSubmit={saveData} editable={editable} initialValues={data?.general_info} />
      </div>
    </div>
  )
}

export default InfoG
