import { AppContext } from "@renderer/providers/AppProvider";
import { useContext } from "react";

export const useGeneralInfo = () => {
	const { data } = useContext(AppContext);

	return data?.general_info || {};
};

export default useGeneralInfo;
