import { useCallback, useEffect, useRef, useState } from 'react'
import { format, isValid } from 'date-fns'
import { useAppActions, useAppData } from '@renderer/providers/AppProvider'
import InfoForm from '@renderer/form/info_general/form'
import ConfirmModal from '@renderer/generic/confirmModal'
import TextItem, { useTranslation } from '@renderer/generic/textItem'

type ReplaceDefaultPaymentDate = {
  from: unknown
  to: unknown
  mode?: 'matching-default' | 'all-payment-dates'
}

type PendingPaymentDateUpdate = {
  values: any
  replaceDefaultPaymentDate: ReplaceDefaultPaymentDate
}

const InfoG = ({ editable }) => {
  const data = useAppData()
  const { setData } = useAppActions()
  const translate = useTranslation()
  const [pendingPaymentDateUpdate, setPendingPaymentDateUpdate] =
    useState<PendingPaymentDateUpdate | null>(null)
  const currentDefaultPaymentDateRef = useRef(data?.general_info?.config?.date_paiement)

  useEffect(() => {
    if (!pendingPaymentDateUpdate) {
      currentDefaultPaymentDateRef.current = data?.general_info?.config?.date_paiement
    }
  }, [data?.general_info?.config?.date_paiement, pendingPaymentDateUpdate])

  const persistGeneralInfo = useCallback(
    (values: any, replaceDefaultPaymentDate: ReplaceDefaultPaymentDate | null = null) => {
      setData(
        { general_info: values },
        {
          setDefault: true,
          ...(replaceDefaultPaymentDate
            ? {
                replaceDefaultPaymentDate
              }
            : {})
        }
      )
    },
    [setData]
  )

  const saveData = useCallback(
    (values: any) => {
      const previousPaymentDate = currentDefaultPaymentDateRef.current
      const nextPaymentDate = values?.config?.date_paiement
      const paymentDateChanged = previousPaymentDate && previousPaymentDate !== nextPaymentDate

      if (paymentDateChanged) {
        setPendingPaymentDateUpdate({
          values,
          replaceDefaultPaymentDate: {
            from: previousPaymentDate,
            to: nextPaymentDate,
            mode: 'matching-default'
          }
        })
        return
      }

      currentDefaultPaymentDateRef.current = nextPaymentDate
      persistGeneralInfo(values)
    },
    [persistGeneralInfo]
  )

  const applyDefaultPaymentDateUpdate = useCallback(() => {
    if (!pendingPaymentDateUpdate) return

    persistGeneralInfo(
      pendingPaymentDateUpdate.values,
      pendingPaymentDateUpdate.replaceDefaultPaymentDate
    )
    currentDefaultPaymentDateRef.current = pendingPaymentDateUpdate.replaceDefaultPaymentDate.to
    setPendingPaymentDateUpdate(null)
  }, [pendingPaymentDateUpdate, persistGeneralInfo])

  const applyAllPaymentDateUpdate = useCallback(() => {
    if (!pendingPaymentDateUpdate) return

    persistGeneralInfo(pendingPaymentDateUpdate.values, {
      ...pendingPaymentDateUpdate.replaceDefaultPaymentDate,
      mode: 'all-payment-dates'
    })
    currentDefaultPaymentDateRef.current = pendingPaymentDateUpdate.replaceDefaultPaymentDate.to
    setPendingPaymentDateUpdate(null)
  }, [pendingPaymentDateUpdate, persistGeneralInfo])

  const skipDefaultPaymentDateUpdate = useCallback(() => {
    if (!pendingPaymentDateUpdate) return

    persistGeneralInfo(pendingPaymentDateUpdate.values)
    currentDefaultPaymentDateRef.current = pendingPaymentDateUpdate.replaceDefaultPaymentDate.to
    setPendingPaymentDateUpdate(null)
  }, [pendingPaymentDateUpdate, persistGeneralInfo])

  const previousDefaultPaymentDateLabel = (() => {
    const previousDate = pendingPaymentDateUpdate?.replaceDefaultPaymentDate.from
    if (!previousDate) return '-'

    const date = new Date(previousDate as any)
    return isValid(date) ? format(date, 'dd/MM/yyyy') : String(previousDate)
  })()

  const matchingDatesHelp = translate(
    'info_general.default_payment_date_update_apply_help'
  ).replace('{date}', previousDefaultPaymentDateLabel)

  return (
    <div id="content">
      <div id="main">
        <TextItem path="nav.info_general" tag="h1" />
        <InfoForm onSubmit={saveData} editable={editable} initialValues={data?.general_info} />
      </div>
      <ConfirmModal
        isOpen={!!pendingPaymentDateUpdate}
        title={<TextItem path="info_general.default_payment_date_update_title" />}
        confirmLabel={<TextItem path="info_general.default_payment_date_update_apply" />}
        secondaryConfirmLabel={
          <TextItem path="info_general.default_payment_date_update_apply_all" />
        }
        cancelLabel={<TextItem path="info_general.default_payment_date_update_skip" />}
        onConfirm={applyDefaultPaymentDateUpdate}
        onSecondaryConfirm={applyAllPaymentDateUpdate}
        onCancel={skipDefaultPaymentDateUpdate}
      >
        <TextItem path="info_general.default_payment_date_update_confirm" tag="p" />
        <ul className="confirm-modal-help">
          <li>
            <TextItem path="info_general.default_payment_date_update_skip_help" />
          </li>
          <li>{matchingDatesHelp}</li>
          <li>
            <TextItem path="info_general.default_payment_date_update_apply_all_help" />
          </li>
        </ul>
      </ConfirmModal>
    </div>
  )
}

export default InfoG
