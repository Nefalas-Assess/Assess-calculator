import TextItem from "@renderer/generic/textItem";
import Field from "@renderer/generic/field";
import constants from "@renderer/constants";

const IncapacitePerma = ({ control, editable, formValues }) => {
	return (
		<td colSpan={2} style={{ padding: 0, border: "none" }}>
			<table style={{ width: "100%" }} className="table-inside-table">
				<tbody>
					<tr>
						<TextItem
							path="info_general.incapacite_perma.title"
							colSpan={6}
							style={{ fontWeight: "bold" }}
							tag="td"
						/>
					</tr>
					<tr>
						<TextItem
							path="info_general.incapacite_perma.personnel"
							tag="td"
							colSpan={2}
							style={{ fontWeight: "bold" }}
						/>
						<TextItem
							path="info_general.incapacite_perma.menagere"
							tag="td"
							colSpan={2}
							style={{ fontWeight: "bold" }}
						/>
						<TextItem
							path="info_general.incapacite_perma.economique"
							tag="td"
							colSpan={2}
							style={{ fontWeight: "bold" }}
						/>
					</tr>
					<tr>
						<TextItem path="info_general.incapacite_perma.method" tag="td" />
						<td>
							<Field
								control={control}
								type="select"
								options={constants.method_incapacite_perma}
								name="ip.personnel.method"
								editable={editable}
								noSelect
							></Field>
						</td>
						<TextItem path="info_general.incapacite_perma.method" tag="td" />
						<td>
							<Field
								control={control}
								type="select"
								options={constants.method_incapacite_perma}
								name="ip.menagere.method"
								editable={editable}
								noSelect
							></Field>
						</td>
						<TextItem path="info_general.incapacite_perma.method" tag="td" />
						<td>
							<Field
								control={control}
								type="select"
								options={constants.method_incapacite_perma}
								name="ip.economique.method"
								editable={editable}
								noSelect
							></Field>
						</td>
					</tr>
					<tr>
						<TextItem path="info_general.incapacite_perma.interet" tag="td" />
						<td>
							<Field
								control={control}
								type={"number"}
								name="ip.personnel.interet"
								editable={editable}
							>
								{(props) => (
									<input
										style={{ width: 50 }}
										step="0.01"
										max={100}
										{...props}
									/>
								)}
							</Field>
						</td>
						<TextItem path="info_general.incapacite_perma.interet" tag="td" />
						<td>
							<Field
								control={control}
								type={"number"}
								name="ip.menagere.interet"
								editable={editable}
							>
								{(props) => (
									<input
										style={{ width: 50 }}
										step="0.01"
										max={100}
										{...props}
									/>
								)}
							</Field>
						</td>
						<TextItem path="info_general.incapacite_perma.interet" tag="td" />
						<td>
							<Field
								control={control}
								type={"number"}
								name="ip.economique.interet"
								editable={editable}
							>
								{(props) => (
									<input
										style={{ width: 50 }}
										step="0.01"
										max={100}
										{...props}
									/>
								)}
							</Field>
						</td>
					</tr>
				</tbody>
			</table>
		</td>
	);
};

export default IncapacitePerma;
