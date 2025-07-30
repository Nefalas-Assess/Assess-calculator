import { validateData } from "@renderer/helpers/validation";
import { prepareDataForSave } from "@renderer/utils/migrations";
import { intervalToDuration } from "date-fns";
import React, { createContext, useCallback, useEffect, useState } from "react";

// Define types for the context
interface AppContextType {
	data: any;
	errors: any;
	setData: (data: any, options?: any) => void;
	reset: () => void;
	filePath: string | null;
	setFilePath: (path: string | null) => void;
	save: () => Promise<void>;
	back: () => void;
	toggleDarkMode: () => void;
	mode: string;
	lg: string;
	setLg: (lang: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const setDefaultValues = (obj: any, defaultValues: any): any => {
	// Create a deep copy to avoid mutating the original object
	const result = structuredClone(obj);

	// Recursively traverse object and set default values
	const setDefaults = (current: any, defaults: any): any => {
		// Skip if current is null/undefined or not an object
		if (!current || typeof current !== "object") return current;

		// Handle arrays by recursively checking each item
		if (Array.isArray(current)) {
			return current.map((item) => {
				const newItem = { ...item };
				Object.entries(defaults).forEach(([key, value]) => {
					if (key in defaults) {
						newItem[key] = value;
					}
				});
				return newItem;
			});
		}

		// Handle objects
		Object.entries(defaults).forEach(([key, value]) => {
			if (typeof value !== "object") {
				// Set default if value doesn't exist or is empty string
				current[key] = value;
			} else if (
				typeof value === "object" &&
				value !== null &&
				!Array.isArray(value)
			) {
				// Recursively set defaults for nested objects
				current[key] = setDefaults(current[key], value);
			}
		});

		return current;
	};

	return setDefaults(result, defaultValues);
};

const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const [data, setData] = useState<any>(null);
	const [errors, setErrors] = useState<any>(null);
	const [lg, setLg] = useState<string>("fr");
	const [darkMode, setDarkMode] = useState<boolean>(true);
	const [filePath, setFilePath] = useState<string | null>(null);

	// Define initial data structure
	const initialData = {
		version: import.meta.env.VITE_APP_VERSION,
	};

	const handleSave = useCallback(async () => {
		try {
			if (filePath && data) {
				// Ensure data has the current version before saving
				const currentVersion = import.meta.env.VITE_APP_VERSION;
				const dataToSave = prepareDataForSave(data, currentVersion);
				await window.api.writeFile(
					filePath,
					JSON.stringify(dataToSave, null, 2),
				);
			}
		} catch (err) {
			console.error(err);
		}
	}, [filePath, data]);

	const handleBackHome = useCallback(() => {
		handleSave();
		setFilePath(null);
		setData(null);
	}, [handleSave]);

	const computeData = useCallback((res, options) => {
		if (!res.computed_info) {
			res.computed_info = {};
		}

		if (res?.general_info) {
			const { years: age_consolidation = 0 } = intervalToDuration({
				start: res?.general_info?.date_naissance,
				end: res?.general_info?.date_consolidation,
			});
			res.computed_info.age_consolidation = age_consolidation;
			if (res?.general_info?.calcul_interets === "true") {
				res.computed_info.rate = parseFloat(res?.general_info?.taux_int);
			}

			if (options?.setDefault) {
				if (res?.general_info?.config?.default_contribution) {
					res.prejudice_proche = setDefaultValues(res?.prejudice_proche, {
						menage_contribution:
							res?.general_info?.config?.default_contribution,
					});
					res.forfait_ip = setDefaultValues(res?.forfait_ip, {
						contribution_imp: res?.general_info?.config?.default_contribution,
					});
					res.incapacite_perma_menage_cap = setDefaultValues(
						res?.incapacite_perma_menage_cap,
						{
							conso_contribution:
								res?.general_info?.config?.default_contribution,
							perso_contribution:
								res?.general_info?.config?.default_contribution,
						},
					);
					if ((res?.incapacite_temp_menagere?.periods || [])?.length !== 0) {
						res.incapacite_temp_menagere.periods = setDefaultValues(
							res?.incapacite_temp_menagere?.periods,
							{
								contribution: res?.general_info?.config?.default_contribution,
							},
						);
					}
				}
			}
		}

		return res;
	}, []);

	const storeData = useCallback(
		(res, options) => {
			const computedData = computeData({ ...(data || {}), ...res }, options);
			const errors = validateData(computedData);
			setData(computedData);
			setErrors(errors);
		},
		[computeData, data],
	);

	const toggleDarkMode = useCallback(() => {
		window.api.setStore("mode", darkMode ? "light" : "dark");
		setDarkMode(!darkMode);
	}, [darkMode]);

	const setLanguage = useCallback((lang: string) => {
		window.api.setStore("lang", lang);
		setLg(lang);
	}, []);

	const resetData = useCallback(() => {
		setData(initialData);
	}, []);

	useEffect(() => {
		const getMode = async () => {
			const mode = await window.api.getStore("mode");
			if (mode === "dark") {
				setDarkMode(true);
			} else {
				setDarkMode(false);
			}
		};
		const getLang = async () => {
			const lang = await window.api.getStore("lang");
			if (!lang) {
				setLg("fr");
			} else {
				setLg(lang);
			}
		};
		getMode();
		getLang();
	}, []);

	// the value passed in here will be accessible anywhere in our application
	// you can pass any value, in our case we pass our state and it's update method
	return (
		<AppContext.Provider
			value={{
				data,
				errors,
				setData: storeData,
				reset: resetData,
				filePath,
				setFilePath,
				save: handleSave,
				back: handleBackHome,
				toggleDarkMode,
				mode: darkMode ? "dark" : "light",
				lg,
				setLg: setLanguage,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

export default AppProvider;
