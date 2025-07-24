import { useContext } from "react";
import { AppContext } from "@renderer/providers/AppProvider";
import content from "@renderer/traduction";

/**
 * Pure function to get translation for a given path and language
 */
const getTranslation = (
	path: string | { [key: string]: string },
	lg: string,
): string => {
	if (typeof path === "object") {
		return path[lg];
	}

	const keys = path.split(".");
	let result: any = content;

	for (const key of keys) {
		if (result[key] === undefined) {
			return path; // Return path if translation doesn't exist
		}
		result = result[key];
	}

	return result[lg] || path; // Return translation or path if language doesn't exist
};

/**
 * Hook to get translation using current app context
 */
export const useTranslation = () => {
	const { lg } = useContext(AppContext);

	return (path: string | { [key: string]: string }) => {
		return getTranslation(path, lg);
	};
};

interface TextItemProps extends React.HTMLAttributes<HTMLElement> {
	path: string;
	tag?: keyof JSX.IntrinsicElements; // Allows using any HTML tag (div, span, p, etc.)
}

/**
 * Translation component
 */
export const TextItem = ({
	path,
	tag: Tag = "span",
	...rest
}: TextItemProps) => {
	const translate = useTranslation();
	const translation = translate(path);

	return <Tag {...rest}>{translation}</Tag>;
};

export default TextItem;
