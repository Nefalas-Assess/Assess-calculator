import AppProvider from "./providers/AppProvider";
import { HashRouter, Route, Routes } from "react-router";
import AppLayout from "./layouts/AppLayout";
import Home from "@renderer/components/Home";
import IPForfait from "@renderer/components/incapacite_permanente/forfait";
import IPPersonnel from "@renderer/components/incapacite_permanente/personnel_cap";
import IPMenagère from "@renderer/components/incapacite_permanente/menage_cap";
import IPFrais from "@renderer/components/incapacite_permanente/frais_cap";
import IPEconomique from "@renderer/components/incapacite_permanente/economique_cap";
import IPParticulier from "@renderer/components/incapacite_permanente/particuliers";

import Effa from "@renderer/components/incapacite_temporaire/effa";
import Hosp from "@renderer/components/incapacite_temporaire/hosp";
import Pretium from "@renderer/components/incapacite_temporaire/pretium";
import Personnel from "@renderer/components/incapacite_temporaire/personnel";
import Menagere from "@renderer/components/incapacite_temporaire/menagere";
import Economique from "@renderer/components/incapacite_temporaire/economique";
import InfoG from "@renderer/components/general/infog";
import Frais from "@renderer/components/general/frais";
import Provisions from "@renderer/components/general/provisions";
import Recapitulatif from "@renderer/components/general/recapitulatif";
import FraisFun from "@renderer/components/deces/frais_deces";
import PrejudiceEXH from "@renderer/components/deces/prejudice_exh";
import PrejudiceProche from "@renderer/components/deces/prejudice_proche";
import ToastProvider from "./providers/ToastProvider";
import License from "./License";

const IncapaciteTemp = () => {
	return (
		<Routes>
			<Route path="/personnel" element={<Personnel />} />
			<Route path="/menagère" element={<Menagere />} />
			<Route path="/economique" element={<Economique />} />
			<Route path="/hosp" element={<Hosp />} />
			<Route path="/pretium" element={<Pretium />} />
			<Route path="/effa" element={<Effa />} />
		</Routes>
	);
};

const IncapacitePerma = () => {
	return (
		<Routes>
			<Route path="/personnel" element={<IPPersonnel />} />
			<Route path="/menagère" element={<IPMenagère />} />
			<Route path="/economique" element={<IPEconomique />} />
			<Route path="/frais" element={<IPFrais />} />
			<Route path="/particuliers" element={<IPParticulier />} />
			<Route path="/forfait" element={<IPForfait />} />
		</Routes>
	);
};

const Deces = () => {
	return (
		<Routes>
			<Route path="/frais" element={<FraisFun />} />
			<Route path="/prejudice_exh" element={<PrejudiceEXH />} />
			<Route path="/prejudice_proche" element={<PrejudiceProche />} />
		</Routes>
	);
};

const Main = () => {
	return (
		<HashRouter>
			<Routes>
				<Route element={<AppLayout />}>
					<Route index element={<Home />} />
					<Route path="infog" element={<InfoG />} />
					<Route path="ip/*" element={<IncapacitePerma />} />
					<Route path="it/*" element={<IncapaciteTemp />} />
					<Route path="deces/*" element={<Deces />} />
					<Route path="frais" element={<Frais />} />
					<Route path="provisions" element={<Provisions />} />
					<Route path="recap" element={<Recapitulatif />} />
				</Route>
			</Routes>
		</HashRouter>
	);
};

function App(): JSX.Element {
	return (
		<License>
			<AppProvider>
				<ToastProvider>
					<Main />
				</ToastProvider>
			</AppProvider>
		</License>
	);
}

export default App;
