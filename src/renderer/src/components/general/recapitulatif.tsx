import React, { useContext, useRef } from 'react'
import InfoG from './infog'
import Frais from './frais'
import Personnel from '../incapacite_temporaire/personnel'
import Menagere from '../incapacite_temporaire/menagere'
import Economique from '../incapacite_temporaire/economique'
import Effa from '../incapacite_temporaire/effa'
import Hospitalisation from '../incapacite_temporaire/hosp'
import PretiumDoloris from '../incapacite_temporaire/pretium'
import Forfait from '../incapacite_permanente/forfait'
import PersonnelCap from '../incapacite_permanente/personnel_cap'
import MenageCap from '../incapacite_permanente/menage_cap'
import EconomiqueCap from '../incapacite_permanente/economique_cap'
import FraisCap from '../incapacite_permanente/frais_cap'
import Particuliers from '../incapacite_permanente/particuliers'
import FraisFun from '../deces/frais_deces'
import PrejudiceEXH from '../deces/prejudice_exh'
import PrejudiceProche from '../deces/prejudice_proche'
import TotalBox from '@renderer/generic/totalBox'
import TotalBoxInterest from '@renderer/generic/totalBoxInterest'
import DelayedContent from '@renderer/generic/delayContent'
import { AppContext } from '@renderer/providers/AppProvider'
import TextItem from '@renderer/generic/textItem'
import Provisions from './provisions'
import hasDefinedValues from '@renderer/utils/hasDefinedValues'

const PRINT_MARGIN_WIDTH = 30

const MINIMAL_PRINT_STYLES = `
	* {
		box-sizing: border-box;
		font-family: "Inter", "Segoe UI", sans-serif;
		color: #111;
		font-size: 10.5px;
	}

	body {
		margin: 0;
		background: #fff;
		line-height: 1.45;
		color: #111;
		display: flex;
	}

	.print-margin {
		width: ${PRINT_MARGIN_WIDTH - 5}px;
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
	}

	.print-margin img {
		max-width: 100%;
		height: auto;
		object-fit: contain;
	}

	.print-margin-bottom {
		margin-top: auto;
		display: flex;
		justify-content: center;
	}

	.print-margin-bottom p {
		writing-mode: vertical-rl;
		text-orientation: upright;
		margin: 0;
		bottom: 0;
		font-size: 6px;
		text-transform: uppercase;
	}

	.print-content {
		margin-left: ${PRINT_MARGIN_WIDTH}px;
		padding: 18px 28px 36px;
		background: #fff;
		padding-left: 0;
	}

	.print-content > * {
		page-break-inside: avoid;
		break-inside: avoid;
	}

	.print-content h1,
	.print-content h2,
	.print-content h3,
	.print-content h4 {
		text-transform: uppercase;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: #1b2559;
		margin: 26px 0 10px;
		padding-bottom: 6px;
		border-bottom: 2px solid #a5b4fc;
	}

	.print-content h1 {
		font-size: 13px;
	}

	.print-content h2,
	.print-content h3,
	.print-content h4 {
		font-size: 11.5px;
		color: #2e3670;
	}

	.print-content #recap #content {
		padding-top: 10px;
		background: transparent;
		border: none;
		box-shadow: none;
	}

	.print-content #recap #content + #content {
		margin-top: 18px;
		border-top: 1px solid #dfe3f4;
		padding-top: 18px;
	}

	.print-content table {
		page-break-inside: auto;
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		margin-bottom: 16px;
		border: 1px solid #cfd4e6;
		border-radius: 8px;
		overflow: hidden;
	}

	.print-content table tr {
		page-break-inside: avoid;
	}

	.print-content table th,
	.print-content table td {
		page-break-inside: avoid;
		border: none;
		padding: 6px 10px;
		text-align: left;
		font-size: 9px;
	}

	.print-content table th {
		color: #1b2559;
		font-weight: 600;
		text-transform: none;
		letter-spacing: 0;
		border-bottom: 1px solid #cfd4e6;
	}

	.print-content table tr + tr th,
	.print-content table tr + tr td {
		border-top: 1px solid #cfd4e6;
	}

	.print-content table th + th,
	.print-content table td + td {
		border-left: 1px solid #cfd4e6;
	}

	.print-content table tbody tr:nth-child(even) {
		background: transparent;
	}

	.print-content .total-box {
		margin: 14px 0 18px;
		padding: 12px 16px;
		border: 1px solid #c4c9e4;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.print-content .total-box strong {
		font-size: 10px;
		color: #25306d;
		letter-spacing: 0.08em;
	}

	.print-content .total-box .money {
		font-size: 12px;
		font-weight: 700;
		color: #111431;
	}

	.print-content .final-total-boxes {
		margin-top: 24px;
		border-top: 2px solid #a5b4fc;
		padding-top: 20px;
		display: grid;
		gap: 14px;
	}

	.tooltip-box {
		display: none !important;
	}

	.tooltip-container,
	.tooltip-trigger {
		display: inline-flex !important;
		align-items: center;
		gap: 4px;
	}

	.tooltip-container svg,
	.tooltip-trigger svg {
		display: none !important;
	}
`

const Recapitulatif = () => {
  const { data } = useContext(AppContext)

  const contentRef = useRef()

  const handlePrint = async () => {
    const content = contentRef.current?.outerHTML || ''
    let styles = MINIMAL_PRINT_STYLES

    if (data?.general_info?.calcul_interets === 'false') {
      styles += `
			.int {
				display: none !important;
			}
			`
    }

    try {
      const absoluteLogoPath = `${await window.api.resolvePath('src/renderer/src/assets/icon-plain.png')}`
      window.api.print(content, styles, absoluteLogoPath)
    } catch (error) {
      console.error('Erreur lors de la résolution du chemin du logo:', error)
    }
  }

  return (
    <>
      <div id="top-menu">
        <button onClick={handlePrint} style={{ marginTop: '20px' }}>
          <TextItem path="recapitulatif.print" />
        </button>
      </div>
      <div ref={contentRef} id="recap">
        {data?.general_info && <InfoG editable={false} />}
        {data?.frais && <Frais editable={false} />}
        {data?.incapacite_temp_personnel &&
          data?.incapacite_temp_personnel?.periods?.length > 0 && <Personnel editable={false} />}
        {data?.incapacite_temp_menagere && data?.incapacite_temp_menagere?.periods?.length > 0 && (
          <Menagere editable={false} />
        )}
        {data?.incapacite_temp_economique &&
          (data?.incapacite_temp_economique?.brut?.length > 0 ||
            data?.incapacite_temp_economique?.net?.length > 0 ||
            (data?.incapacite_temp_economique?.estimate &&
              data?.incapacite_temp_economique?.estimate !== '')) && (
            <Economique editable={false} />
          )}
        {data?.efforts_accrus && data?.efforts_accrus?.efforts?.length > 0 && (
          <Effa editable={false} />
        )}
        {data?.hospitalisation && data?.hospitalisation?.periods?.length > 0 && (
          <Hospitalisation editable={false} />
        )}
        {data?.pretium_doloris && data?.pretium_doloris?.periods?.length > 0 && (
          <PretiumDoloris editable={false} />
        )}
        {data?.forfait_ip &&
          Object.values(data?.general_info?.ip)?.filter((it) => it?.method === 'forfait')
            ?.length !== 0 && <Forfait editable={false} />}
        {data?.incapacite_perma_personnel_cap &&
          data?.general_info?.ip?.personnel?.method === 'capitalized' && (
            <PersonnelCap editable={false} />
          )}
        {data?.incapacite_perma_menage_cap &&
          data?.general_info?.ip?.menagere?.method === 'capitalized' && (
            <MenageCap editable={false} />
          )}
        {data?.incapacite_perma_economique_cap &&
          data?.general_info?.ip?.economique?.method === 'capitalized' && (
            <EconomiqueCap editable={false} />
          )}
        {data?.incapacite_perma_charges && <FraisCap editable={false} />}
        {data?.prejudice_particulier && <Particuliers editable={false} />}

        {data?.frais_funeraire && <FraisFun editable={false} />}
        {data?.prejudice_exh && <PrejudiceEXH editable={false} />}
        {data?.prejudice_proche && <PrejudiceProche editable={false} />}
        {data?.provisions &&
          Array.isArray(data?.provisions?.provisions) &&
          hasDefinedValues(data?.provisions?.provisions) && <Provisions editable={false} />}

        <DelayedContent delay={1000}>
          <div className="final-total-boxes">
            <TotalBoxInterest
              selector="total-interest"
              documentRef={contentRef}
              label="recapitulatif.total_interest"
            />
            <TotalBox selector="total" documentRef={contentRef} label="recapitulatif.total" />
          </div>
        </DelayedContent>
      </div>
    </>
  )
}

export default Recapitulatif
