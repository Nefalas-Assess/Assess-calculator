import constants from "@renderer/constants";
import { AppContext } from "@renderer/providers/AppProvider";
import { format, isValid } from "date-fns";
import { useCallback, useContext, useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "./textItem";

const ReferenceInput = ({ options, onChange, value }) => {
	const appContext = useContext(AppContext);
	const referenceOptions =
		appContext?.referenceTypes || constants.reference_type || [];
	const [value1, setValue1] = useState("");
	const [value2, setValue2] = useState("");

	const translate = useTranslation();

	useEffect(() => {
		if (
			value1 &&
			((options && value !== value1 + "_" + value2) || (!options && !value))
		) {
			if (value2) {
				onChange(value1 + "_" + value2);
			} else if (!options) {
				onChange(value1);
			}
		}
	}, [value1, value2, options, value]);

	useEffect(() => {
		if (value) {
			const splitted = value.split("_");
			setValue1(splitted[0] + "_" + splitted[1]);
			setValue2(splitted?.slice(2).join("_"));
		}
	}, [value]);

	return (
		<>
			<select value={value1} onChange={(e) => setValue1(e.target.value)}>
				<option value={""}>Select</option>
				{(referenceOptions || [])?.map((it, key) => (
					<option key={key} value={it?.value}>
						{translate(it?.label || it?.value)}
					</option>
				))}
			</select>
			{options && (
				<select
					value={value2}
					onChange={(e) => setValue2(e.target.value)}
					style={{ maxWidth: "100%" }}
				>
					<option value={""}>Select</option>
					{(options || [])?.map((it, key) => (
						<option key={key} value={it?.value}>
							{translate(it?.label || it?.value)}
						</option>
					))}
				</select>
			)}
		</>
	);
};

const Field = ({
	editable,
	name,
	type,
	children,
	control,
	options,
	style,
	noSelect,
}) => {
	const translate = useTranslation();
	const appContext = useContext(AppContext);
	const referenceOptions =
		appContext?.referenceTypes || constants.reference_type || [];

	const renderValue = useCallback(
		(val) => {
			if (type === "date") {
				if (val) {
					const date = new Date(val);
					return isValid(date) ? format(date, "dd/MM/yyyy") : "-";
				}
			}

			if (type === "select") {
				if (val?.toString() && options) {
					const res = (options || [])?.find(
						(e) => e?.value === val || e?.value?.toString() === val,
					)?.label;
					return res ? translate(res) : "-";
				}
			}

			if (type === "textarea") {
				return <div style={style}>{val}</div>;
			}

			if (type === "reference") {
				const ref = (referenceOptions || [])?.find((e) =>
					val?.includes(e?.value),
				);
				const ref2 = (options || [])?.find(
					(e) => e?.value === val?.split(ref?.value + "_")?.[1],
				);

				if (!ref) return "-";

				return `${translate(ref?.label || ref?.value)} ${translate(ref2?.label || ref2?.value || "")}`;
			}

			return val;
		},
		[type, options, style, translate],
	);

	const renderInput = useCallback(
		(field) => {
			if (type === "reference") {
				return (
					<>
						<input style={{ display: "none" }} {...field} />
						<ReferenceInput
							options={options}
							onChange={field.onChange}
							value={field.value} // Pass the initial value from the field
						/>
					</>
				);
			}

			if (type === "select" && options) {
				return (
					<select {...field} style={{ maxWidth: "100%" }}>
						{!noSelect && <option value={""}>Select</option>}
						{(options || [])?.map((it, key) => (
							<option key={key} value={it?.value}>
								{translate(it?.label || it?.value)}
							</option>
						))}
					</select>
				);
			}

			if (type === "textarea") {
				return <textarea style={style} {...field} />;
			}

			return children({ ...field, type });
		},
		[children, type, noSelect, options, style, translate],
	);

	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => {
				return !editable ? renderValue(field?.value) : renderInput(field);
			}}
		/>
	);
};

export default Field;
