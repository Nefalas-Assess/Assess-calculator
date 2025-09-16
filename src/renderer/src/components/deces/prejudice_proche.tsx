import PrejudiceProcheForm from "@renderer/form/deces/prejudice_proche";
import { AppContext } from "@renderer/providers/AppProvider";
import React, { useCallback, useContext, useRef } from "react";

const PrejudiceProche = ({ editable }) => {
	const { data, setData } = useContext(AppContext);

	const ref = useRef(null);

	const saveData = useCallback(
		(values) => {
			setData({ prejudice_proche: values });
		},
		[setData],
	);
	return (
		<div id="content">
			<div id="main" ref={ref}>
				<PrejudiceProcheForm
					onSubmit={saveData}
					editable={editable}
					initialValues={data?.prejudice_proche}
				/>
			</div>
		</div>
	);
};

export default PrejudiceProche;
