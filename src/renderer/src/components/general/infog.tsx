import React, { useCallback, useContext } from "react";
import { AppContext } from "@renderer/providers/AppProvider";
import InfoForm from "@renderer/form/info_general/form";
import TextItem from "@renderer/generic/textItem";

const InfoG = ({ editable }) => {
	const { setData, data } = useContext(AppContext);

	const saveData = useCallback(
		(values) => {
			setData({ general_info: values }, { setDefault: true });
		},
		[setData, data],
	);

	return (
		<div id="content">
			<div id="main">
				<TextItem path="nav.info_general" tag="h1" />
				<InfoForm
					onSubmit={saveData}
					editable={editable}
					initialValues={data?.general_info}
				/>
			</div>
		</div>
	);
};

export default InfoG;
