import { getDays, getMedDate } from "@renderer/helpers/general";
import { AppContext } from "@renderer/providers/AppProvider";
import { format, intervalToDuration, isValid } from "date-fns";
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useForm } from "react-hook-form";
import Money from "@renderer/generic/money";
import Interest from "@renderer/generic/interet";
import Field from "@renderer/generic/field";
import constants from "@renderer/constants";
import FadeIn from "@renderer/generic/fadeIn";
import { useCapitalization } from "@renderer/hooks/capitalization";
import TextItem from "@renderer/generic/textItem";
import CoefficientInfo from "@renderer/generic/coefficientInfo";

export const IPPersonnelCapForm = ({
	onSubmit,
	initialValues,
	editable = true,
}) => {
	const { data } = useContext(AppContext);

	const { handleSubmit, watch, control } = useForm({
		defaultValues: initialValues || {
			conso_amount: 32,
			perso_amount: 32,
		},
	});

	const formValues = watch();

	const previousValuesRef = useRef({});

	const submitForm = (values) => {
		onSubmit(values);
	};

	useEffect(() => {
		const valuesChanged =
			JSON.stringify(formValues) !==
			JSON.stringify(previousValuesRef.current.formValues);

		// Si des valeurs ont changé, soumettre le formulaire
		if (valuesChanged) {
			// Éviter de soumettre si aucune modification réelle
			previousValuesRef.current = {
				formValues,
			};

			handleSubmit(submitForm)(); // Soumet le formulaire uniquement si nécessaire
		}
	}, [formValues, submitForm, handleSubmit]);

	const days = useMemo(() => {
		return getDays({
			start: data?.general_info?.date_consolidation,
			end: formValues?.paiement,
		});
	}, [formValues, data]);

	const getConsoAmount = useCallback(
		(values) => {
			const { conso_amount } = values || {};
			const conso_pourcentage = data?.general_info?.ip?.personnel?.interet;

			return {
				tooltip: (
					<div>
						<math>
							<mn>{parseInt(days || 0)}</mn>
							<mo>x</mo>
							<mn>{parseFloat(conso_amount || 0)}</mn>
							<mo>x</mo>
							<mfrac>
								<mn>{parseFloat(conso_pourcentage || 0)}</mn>
								<mn>100</mn>
							</mfrac>
						</math>
					</div>
				),
				value: (
					parseInt(days || 0) *
					parseFloat(conso_amount || 0) *
					(parseFloat(conso_pourcentage || 0) / 100)
				).toFixed(2),
			};
		},
		[days, data],
	);

	const getCapAmount = useCallback(
		(values) => {
			const { paiement = "", interet = 0, perso_amount = 0 } = values;

			const perso_pourcentage = data?.general_info?.ip?.personnel?.interet;

			const index = constants.interet_amount?.findIndex(
				(e) => e?.value === parseFloat(interet || 0),
			);

			const coef = useCapitalization({
				end: paiement,
				ref: formValues?.reference,
				index,
				asObject: true,
			});

			return {
				tooltip: (
					<div>
						<math>
							<mn>{parseFloat(perso_amount)}</mn>
							<mo>x</mo>
							<mfrac>
								<mn>{parseFloat(perso_pourcentage)}</mn>
								<mn>100</mn>
							</mfrac>
							<mo>x</mo>
							<mn>365</mn>
							<mo>x</mo>
							<CoefficientInfo
								{...coef?.info}
								headers={constants?.interet_amount}
							>
								<mn>{coef?.value}</mn>
							</CoefficientInfo>
						</math>
					</div>
				),
				value: (
					parseFloat(perso_amount) *
					(parseFloat(perso_pourcentage) / 100) *
					365 *
					parseFloat(coef?.value)
				).toFixed(2),
			};
		},
		[data],
	);

	return (
		<form onSubmit={handleSubmit(submitForm)}>
			<TextItem path="incapacite_perma.personnel.title" tag="h1" />
			<TextItem path="common.variables_cap" tag="h3" />
			<table id="IPVariables">
				<tbody>
					<tr>
						<TextItem path="common.ref_table" tag="td" />
						<td>
							<Field
								control={control}
								type="reference"
								options={constants.reference_light}
								name={`reference`}
								editable={editable}
							></Field>
						</td>
					</tr>
					<tr>
						<TextItem path="common.taux_interet_capitalisation" tag="td" />
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
						<TextItem path="common.date_paiement" tag="td" />
						<td>
							<Field
								control={control}
								type="date"
								name={`paiement`}
								editable={editable}
							>
								{(props) => <input {...props} />}
							</Field>
						</td>
					</tr>
				</tbody>
			</table>

			<FadeIn
				show={
					formValues?.paiement && formValues?.reference && formValues?.interet
				}
			>
				<TextItem path="common.period_consolidation_payment" tag="h3" />
				<table id="ippcTable" style={{ maxWidth: 1200 }}>
					<thead>
						<tr>
							<th style={{ width: 50 }}>%</th>
							<TextItem path="common.date_consolidation" tag="th" />
							<TextItem path="common.date_paiement" tag="th" />
							<TextItem path="common.days" tag="th" style={{ width: 50 }} />
							<TextItem path="common.indemnite_journaliere" tag="th" />
							<TextItem path="common.total" tag="th" />
							<TextItem path="common.interest" tag="th" className="int" />
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>{data?.general_info?.ip?.personnel?.interet}</td>
							<td>
								{data?.general_info?.date_consolidation &&
									format(data?.general_info?.date_consolidation, "dd/MM/yyyy")}
							</td>
							<td>
								{formValues?.paiement &&
									format(formValues?.paiement, "dd/MM/yyyy")}
							</td>

							<td style={{ width: 50 }}>{days || 0}</td>
							<td>
								<Field
									control={control}
									name={`conso_amount`}
									type="number"
									editable={editable}
								>
									{(props) => <input style={{ width: 50 }} {...props} />}
								</Field>
							</td>
							<td>
								<Money
									value={getConsoAmount(formValues)?.value}
									tooltip={getConsoAmount(formValues)?.tooltip}
								/>
							</td>
							<td className="int">
								<Interest
									amount={getConsoAmount(formValues)?.value}
									start={getMedDate({
										start: data?.general_info?.date_consolidation,
										end: formValues?.paiement,
									})}
									end={formValues?.paiement}
								/>
							</td>
						</tr>
					</tbody>
				</table>

				<TextItem path="incapacite_perma.personnel.incapacite_perma" tag="h3" />
				<table id="IPCAPTable" style={{ maxWidth: 1200 }}>
					<thead>
						<tr>
							<th style={{ width: 50 }}>%</th>
							<TextItem path="common.date_paiement" tag="th" />
							<TextItem path="common.indemnite_journaliere" tag="th" />
							<TextItem path="common.total" tag="th" />
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>{data?.general_info?.ip?.personnel?.interet}</td>
							<td>
								{formValues?.paiement &&
									format(formValues?.paiement, "dd/MM/yyyy")}
							</td>
							<td>
								<Field
									control={control}
									name={`perso_amount`}
									type="number"
									editable={editable}
								>
									{(props) => <input style={{ width: 50 }} {...props} />}
								</Field>
							</td>
							<td>
								<Money
									value={getCapAmount(formValues)?.value}
									tooltip={getCapAmount(formValues)?.tooltip}
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</FadeIn>
		</form>
	);
};

export default IPPersonnelCapForm;
