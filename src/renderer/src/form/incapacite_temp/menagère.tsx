import { calculateDaysBeforeAfter25 } from "@renderer/helpers/general";
import { AppContext } from "@renderer/providers/AppProvider";
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import get from "lodash/get";
import cloneDeep from "lodash/cloneDeep";
import Tooltip from "@renderer/generic/tooltip";
import { FaRegQuestionCircle } from "react-icons/fa";
import { format } from "date-fns";
import constants from "@renderer/constants";
import DynamicTable from "@renderer/generic/dynamicTable";
import TextItem from "@renderer/generic/textItem";

const ChildrenCell = ({ children }: { children: any[] }): JSX.Element => {
	const renderToolTipChildren = useCallback((res: any[]): JSX.Element => {
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
				{res?.map(
					(it, key) =>
						it?.birthDate && (
							<div key={key} style={{ padding: 10 }} className="border-item">
								{it?.name} <TextItem path="tooltip.born_at" tag="span" />{" "}
								{format(it?.birthDate, "dd/MM/yyyy")}
								<div>
									<TextItem path="tooltip.number_days_before_25" tag="span" />{" "}
									{it?.days?.before25}
								</div>
								<div>
									<math>
										<mfrac>
											<mn>{it?.days?.before25}</mn>
											<mn>{it?.days?.total}</mn>
										</mfrac>
										<mo>=</mo>
										<mn>{it?.days?.before25 / it?.days?.total}</mn>
									</math>
								</div>
							</div>
						),
				)}
				<div>
					<math>
						{res?.map((it, key) => (
							<React.Fragment key={key}>
								{key !== 0 && <mo>+</mo>}
								<mn>{it?.days?.percentageBefore25}</mn>
							</React.Fragment>
						))}
						<mo>=</mo>
						<mn>
							{res?.reduce((acc, value) => {
								const percentage = parseFloat(
									value?.days?.percentageBefore25 || 0,
								);
								return acc + percentage;
							}, 0)}
						</mn>
					</math>
				</div>
			</div>
		);
	}, []);

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{children
				?.reduce((acc, value) => {
					const percentage = parseFloat(value?.days?.percentageBefore25 || 0);
					return acc + percentage;
				}, 0)
				?.toFixed(2)}
			<Tooltip tooltipContent={renderToolTipChildren(children)}>
				<FaRegQuestionCircle style={{ marginLeft: 5 }} />
			</Tooltip>
		</div>
	);
};

const ITMenagereForm = ({ initialValues, onSubmit, editable = true }) => {
	const { data } = useContext(AppContext);

	const { control, setValue, handleSubmit, watch } = useForm({
		defaultValues: initialValues || {
			periods: [],
		},
	});

	const formValues = watch();

	const previousValuesRef = useRef({});

	const periodsValues = useWatch({
		control,
		name: "periods",
	});

	const submitForm = useCallback(
		(data) => {
			onSubmit(data); // Soumettre avec l'onSubmit passé en prop
		},
		[onSubmit],
	);

	useEffect(() => {
		const valuesChanged =
			JSON.stringify(formValues) !==
				JSON.stringify(previousValuesRef.current.formValues) ||
			JSON.stringify(periodsValues) !==
				JSON.stringify(previousValuesRef.current?.periods);

		// Si des valeurs ont changé, soumettre le formulaire
		if (valuesChanged) {
			// Éviter de soumettre si aucune modification réelle
			previousValuesRef.current = {
				formValues,
				periods: periodsValues,
			};

			handleSubmit(submitForm)(); // Soumet le formulaire uniquement si nécessaire
		}
	}, [formValues, periodsValues, submitForm, handleSubmit]);

	const getTotalAmount = useCallback(
		(item, days, child) => {
			const { amount = 0, percentage = 0, contribution = 0 } = item;
			const childAmount = child?.reduce((acc, value) => {
				const percentage = parseFloat(value?.days?.percentageBefore25 || 0);
				return acc + percentage;
			}, 0);

			const baseAmount = parseFloat(amount) + childAmount * 10;
			return (
				(parseInt(days) || 0) *
				(parseFloat(baseAmount) || 0) *
				((parseFloat(percentage) || 0) / 100) *
				(parseFloat(contribution || 0) / 100)
			).toFixed(2);
		},
		[data],
	);

	const copyDate = useCallback(
		(name) => {
			const initial = get(data, name);
			let filteredData = initial.map(({ start, end }) => ({
				start,
				end,
				amount: 30,
				contribution: data?.general_info?.config?.default_contribution,
			}));
			const currentData = cloneDeep(formValues?.periods);
			if (formValues?.periods) {
				filteredData = currentData.concat(filteredData);
			}
			setValue("periods", filteredData);
		},
		[formValues],
	);

	const children = useMemo(() => data?.general_info?.children || [], [data]);

	const getChildOnPeriod = useCallback(
		(values) => {
			const res = [];
			for (let i = 0; i < children.length; i += 1) {
				const item = children[i];
				// Skip children without birthdate
				if (!item?.birthDate) {
					res.push({ days: { percentageBefore25: 1 } });
				} else {
					const result = calculateDaysBeforeAfter25(item?.birthDate, [
						values?.start,
						values?.end,
					]);
					res.push({ days: result, ...item });
				}
			}
			return res;
		},
		[children],
	);

	const renderTooltipTotal = useCallback((item, days, child) => {
		const { amount = 0, percentage = 0, contribution = 0 } = item;
		const childAmount = child?.reduce((acc, value) => {
			const percentage = parseFloat(value?.days?.percentageBefore25 || 0);
			return acc + percentage;
		}, 0);

		const baseAmount = parseFloat(amount) + childAmount * 10;

		const resultat =
			(parseInt(days) || 0) *
			(parseFloat(baseAmount) || 0) *
			((parseFloat(percentage) || 0) / 100) *
			(parseFloat(contribution || 0) / 100);

		return (
			<div>
				<div>
					<math>
						<mstyle style={{ marginRight: 5 }}>
							<mo>(</mo>
							<mi>A</mi>
							<mo>)</mo>
						</mstyle>
						<mn>{amount}</mn>
						<mo>+</mo>
						<mo>(</mo>
						<mn>{childAmount}</mn>
						<mo>x</mo>
						<mn>10</mn>
						<mo>)</mo>
						<mo>=</mo>
						<mn>{baseAmount}</mn>
					</math>
				</div>
				<math>
					<mn>{days}</mn>
					<mo>x</mo>
					<mi>A</mi>
					<mo>x</mo>
					<mfrac>
						<mn>{percentage}</mn>
						<mn>100</mn>
					</mfrac>
					<mo>x</mo>
					<mfrac>
						<mn>{contribution}</mn>
						<mn>100</mn>
					</mfrac>
					<mo>=</mo>
					<mn>{resultat}</mn>
				</math>
			</div>
		);
	}, []);

	const columns = [
		{ header: "%", key: "percentage", type: "number", width: 50 },
		{ header: "common.start", key: "start", type: "start" },
		{ header: "common.end", key: "end", type: "end" },
		{ header: "common.days", key: "days", type: "calculated" },
		{
			header: "common.children",
			key: "children",
			render: (e, rowData) => (
				<ChildrenCell>{getChildOnPeriod(rowData)}</ChildrenCell>
			),
		},
		{
			header: "common.indemnite_journaliere",
			key: "amount",
			type: "number",
			props: { step: '1' },
			width: 50,
			additionalContent: (rowData) => (
				<div style={{ fontSize: 12 }}>
					(+
					{(
						getChildOnPeriod(rowData)?.reduce((acc, value) => {
							const percentage = parseFloat(
								value?.days?.percentageBefore25 || 0,
							);
							return acc + percentage;
						}, 0) * 10
					)?.toFixed(2)}
					€)
				</div>
			),
		},
		{
			header: "common.contribution",
			key: "contribution",
			type: "select",
			options: constants.contribution,
		},
		{
			header: "common.total",
			key: "total",
			type: "calculated",
			tooltipContent: (rowData, days) =>
				renderTooltipTotal(rowData, days, getChildOnPeriod(rowData)),
		},
		{
			header: "common.date_paiement",
			key: "date_paiement",
			type: "date",
			className: "int",
		},
		{
			header: "common.interest",
			key: "interest",
			type: "interest",
			median: true,
			className: "int",
		},
	];

	const customActions = {
		label: "common.import_date",
		actions: [
			{
				label: "common.personnel",
				action: () => copyDate("incapacite_temp_personnel.periods"),
			},
			{
				label: "common.economique.net",
				action: () => copyDate("incapacite_temp_economique.net"),
			},
			{
				label: "common.economique.brut",
				action: () => copyDate("incapacite_temp_economique.brut"),
			},
		],
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DynamicTable
				title="incapacite_temp.menagere.title"
				columns={columns}
				control={control}
				name="periods"
				formValues={formValues}
				editable={editable}
				addRowDefaults={{
					amount: 30,
					contribution: data?.general_info?.config?.default_contribution,
				}}
				calculateTotal={(rowData, days) =>
					getTotalAmount(rowData, days, getChildOnPeriod(rowData))
				}
				customActions={customActions}
			/>
		</form>
	);
};

export default ITMenagereForm;
