import { MdOutlineErrorOutline } from "react-icons/md";
import Tooltip from "./tooltip";
import TextItem from "./textItem";

const ErrorText = ({ error }) => {
	return <TextItem path={error} />;
};

export const ErrorWrapper = ({ error, children }) => {
	return (
		<td style={error && { backgroundColor: "rgba(255, 0, 0, 0.2)" }}>
			<div style={{ display: "flex", alignItems: "center", gap: 5 }}>
				{children}

				{error && (
					<Tooltip tooltipContent={<ErrorText error={error} />}>
						<MdOutlineErrorOutline style={{ color: "red" }} />
					</Tooltip>
				)}
			</div>
		</td>
	);
};
