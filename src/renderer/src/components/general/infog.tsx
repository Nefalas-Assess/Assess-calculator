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
  const [isPaymentDateModalOpen, setPaymentDateModalOpen] = useState(false)
  const currentDefaultPaymentDateRef = useRef(data?.general_info?.config?.date_paiement)
  const currentBirthDateRef = useRef(data?.general_info?.date_naissance)

  useEffect(() => {
    if (!pendingPaymentDateUpdate) {
      currentDefaultPaymentDateRef.current = data?.general_info?.config?.date_paiement
    }
  }, [data?.general_info?.config?.date_paiement, pendingPaymentDateUpdate])

  const persistGeneralInfo = useCallback(
    (values: any, replaceDefaultPaymentDate: ReplaceDefaultPaymentDate | null = null) => {
      const birthDateChanged =
        currentBirthDateRef.current &&
        values?.date_naissance &&
        currentBirthDateRef.current !== values.date_naissance
      const nextForfait = birthDateChanged ? { ...data?.forfait_ip } : undefined

      if (nextForfait) {
        delete nextForfait.point
        delete nextForfait.perso_point
        delete nextForfait.menage_point
        delete nextForfait.eco_point
      }

      setData(
        {
          general_info: values,
          ...(nextForfait ? { forfait_ip: nextForfait } : {})
        },
        {
          setDefault: true,
          ...(replaceDefaultPaymentDate
            ? {
                replaceDefaultPaymentDate
              }
            : {})
        }
      )
      currentBirthDateRef.current = values?.date_naissance
    },
    [data?.forfait_ip, setData]
  )

  const saveData = useCallback(
    (values: any) => {
      const previousPaymentDate = currentDefaultPaymentDateRef.current
      const nextPaymentDate = values?.config?.date_paiement
      const paymentDateChanged =
        previousPaymentDate && nextPaymentDate && previousPaymentDate !== nextPaymentDate

      if (paymentDateChanged) {
        setPendingPaymentDateUpdate({
          values,
          replaceDefaultPaymentDate: {
            from: previousPaymentDate,
            to: nextPaymentDate,
            mode: 'matching-default'
            }
        })
        setPaymentDateModalOpen(false)
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
    setPaymentDateModalOpen(false)
  }, [pendingPaymentDateUpdate, persistGeneralInfo])

  const applyAllPaymentDateUpdate = useCallback(() => {
    if (!pendingPaymentDateUpdate) return

    persistGeneralInfo(pendingPaymentDateUpdate.values, {
      ...pendingPaymentDateUpdate.replaceDefaultPaymentDate,
      mode: 'all-payment-dates'
    })
    currentDefaultPaymentDateRef.current = pendingPaymentDateUpdate.replaceDefaultPaymentDate.to
    setPendingPaymentDateUpdate(null)
    setPaymentDateModalOpen(false)
  }, [pendingPaymentDateUpdate, persistGeneralInfo])

  const skipDefaultPaymentDateUpdate = useCallback(() => {
    if (!pendingPaymentDateUpdate) return

    persistGeneralInfo(pendingPaymentDateUpdate.values)
    currentDefaultPaymentDateRef.current = pendingPaymentDateUpdate.replaceDefaultPaymentDate.to
    setPendingPaymentDateUpdate(null)
    setPaymentDateModalOpen(false)
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
        <InfoForm
          onSubmit={saveData}
          editable={editable}
          initialValues={data?.general_info}
          defaultPaymentDateAction={
            pendingPaymentDateUpdate ? (
              <button
                type="button"
                onClick={() => setPaymentDateModalOpen(true)}
                className="default-payment-date-action"
              >
                <TextItem path="info_general.default_payment_date_update_open" />
              </button>
            ) : null
          }
        />
      </div>
      <ConfirmModal
        isOpen={!!pendingPaymentDateUpdate && isPaymentDateModalOpen}
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
