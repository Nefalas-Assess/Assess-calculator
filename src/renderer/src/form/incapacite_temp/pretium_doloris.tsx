import { useCallback, useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import DynamicTable from "@renderer/generic/dynamicTable";
import useGeneralInfo from "@renderer/hooks/generalInfo";

const coefficients = [
	{ value: 0.575, label: "0.5/7" },
	{ value: 1.15, label: "1/7" },
	{ value: 2.325, label: "1.5/7" },
	{ value: 3.5, label: "2/7" },
	{ value: 5.25, label: "2.5/7" },
	{ value: 7, label: "3/7" },
	{ value: 9.25, label: "3.5/7" },
	{ value: 11.5, label: "4/7" },
	{ value: 14.25, label: "4.5/7" },
	{ value: 17, label: "5/7" },
	{ value: 20.5, label: "5.5/7" },
	{ value: 24, label: "6/7" },
	{ value: 28, label: "6.5/7" },
	{ value: 32, label: "7/7" },
];

const PretiumDolorisForm = ({ initialValues, onSubmit, editable = true }) => {
	const generalInfo = useGeneralInfo();

	const { control, handleSubmit, watch } = useForm({
		defaultValues: initialValues || {
			periods: [],
		},
	});

	const formValues = watch();

	// Utiliser useWatch pour surveiller les FieldArrays
	const periodsValues = useWatch({
		control,
		name: "periods",
	});

	// Référence pour suivre les anciennes valeurs
	const previousValuesRef = useRef({});

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

	const getAmount = useCallback((values, days) => {
		return {
			value: (
				parseInt(days || 0) * parseFloat(values?.coefficient || 0)
			).toFixed(2),
			tooltip: (
				<math>
					<mn>{parseInt(days || 0)}</mn>
					<mo>x</mo>
					<mn>{parseFloat(values?.coefficient || 0)}</mn>
				</math>
			),
		};
	}, []);

	const columns = [
		{ header: "common.start", key: "start", type: "start" },
		{ header: "common.end", key: "end", type: "end" },
		{ header: "common.days", key: "days", type: "calculated" },
		{
			header: "common.coefficient",
			key: "coefficient",
			type: "select",
			options: coefficients,
			width: 100,
		},
		{ header: "common.total", key: "total", type: "calculated" },
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

	const addRowDefaults = useMemo(() => {
		const defaultRow = {
			amount: 30,
			date_paiement: generalInfo?.config?.date_paiement,
		};
		if (!formValues?.periods?.[0]) {
			defaultRow.start = generalInfo?.date_accident;
		}
		return defaultRow;
	}, [formValues, generalInfo]);

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DynamicTable
				title="incapacite_temp.pretium.title"
				columns={columns}
				control={control}
				name="periods"
				base="pretium_doloris"
				formValues={formValues}
				editable={editable}
				addRowDefaults={addRowDefaults}
				calculateTotal={getAmount}
			/>
		</form>
	);
};

export default PretiumDolorisForm;
