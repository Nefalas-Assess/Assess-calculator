import { AppContext } from "@renderer/providers/AppProvider";
import { useToast } from "@renderer/providers/ToastProvider";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import logo from "@renderer/assets/icon.png";
import get from "lodash/get";
import Tooltip from "@renderer/generic/tooltip";
import Loader from "@renderer/generic/loader";
import { RecentFilesList } from "@renderer/generic/recentFilesList";
import TextItem from "@renderer/generic/textItem";

const LinkItem = ({ to, children, errors, name }) => {
	const errorList = useMemo(
		() => Object.keys(errors || {}).filter((it) => it.startsWith(name)),
		[errors, name],
	);

	return (
		<NavLink
			className={({ isActive }) => (isActive ? "active" : "")}
			to={to}
			style={{ display: "flex", alignItems: "center" }}
		>
			{children}
			{errorList.length > 0 && (
				<div className="error-badge">{errorList.length}</div>
			)}
		</NavLink>
	);
};

const SubNavTitle = ({ path, onClick }) => {
	return (
		<div
			className="sub-nav-title"
			onClick={() => onClick()}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					onClick();
				}
			}}
			tabIndex={0}
			role="button"
		>
			<TextItem path={path} />
		</div>
	);
};

const DetectMissingData = ({ children, data, required }) => {
	const missingData = useMemo(() => {
		const res = [];
		for (let i = 0; i < (required || []).length; i += 1) {
			const item = required[i];

			if (!item?.value && !item?.function) return;

			if (item?.function) {
				if (!item?.function()) {
					res.push(item);
				}
				continue;
			}

			const value = get(data, item?.value);

			if (item?.eq && value !== item?.eq) {
				res.push(item);
			} else if (!value) {
				res.push(item);
			}
		}
		return res;
	}, [data, required]);

	const renderToolTipContent = useCallback(() => {
		return (
			<div>
				<TextItem path={"nav.missing_data"} />
				<ul>
					{missingData?.map((it, key) => (
						<li key={key} style={{ listStyle: "inside" }}>
							{it?.error ? (
								<TextItem path={it?.error} />
							) : (
								<TextItem path={it?.label} />
							)}
						</li>
					))}
				</ul>
			</div>
		);
	}, [missingData]);

	if ((missingData || [])?.length === 0) return children;

	return (
		<Tooltip
			tooltipContent={renderToolTipContent()}
			contentStyle={{ backgroundColor: "red" }}
			style={{ width: "100%" }}
		>
			<div
				style={{
					position: "relative",
					marginTop: -5,
					marginBottom: -5,
					opacity: 0.6,
				}}
			>
				{children}
				<div
					style={{
						position: "absolute",
						width: "100%",
						height: "100%",
						top: 0,
						left: 0,
					}}
				/>
			</div>
		</Tooltip>
	);
};

export const AppLayout = () => {
	const {
		data,
		save,
		back,
		toggleDarkMode,
		mode,
		filePath,
		setLg,
		lg,
		errors,
	} = useContext(AppContext);

	const { addToast, removeToast } = useToast();

	const [incPerma, setIncPerma] = useState(false);
	const [incTemp, setIncTemp] = useState(false);
	const [dead, setDead] = useState(false);

	const [updateCheck, setUpdateCheck] = useState(false);
	const [showDisableConfirm, setShowDisableConfirm] = useState(false);

	const navigate = useNavigate();
	const location = useLocation(); // Utilisé pour détecter l'URL actuelle

	// Mettre incTemp à true lors du chargement si une condition est remplie
	useEffect(() => {
		// Vérifie si l'URL actuelle correspond à une des routes enfants d'"Incapacités Temporaires"
		if (location.pathname.startsWith("/it")) {
			setIncTemp(true);
		}
		if (location.pathname.startsWith("/ip")) {
			setIncPerma(true);
		}
		if (location.pathname.startsWith("/deces")) {
			setDead(true);
		}
	}, [location.pathname]); // Réagir uniquement si le chemin change

	useEffect(() => {
		if (!data) {
			setIncPerma(false);
			setIncTemp(false);
			setDead(false);
		}
	}, [data]);

	useEffect(() => {
		window.api.onUpdateAvailable(() => {
			addToast("toast.update_available", true, "update-available");
			setUpdateCheck(false);
		});

		window.api.onUpdateNotAvailable(() => {
			addToast("toast.update_not_available");
			setUpdateCheck(false);
		});

		window.api.onUpdateDownloaded(() => {
			removeToast("update-available");
			addToast("toast.update_downloaded", true, "update-downloaded", {
				text: "common.restart",
				action: () => window.api.restartApp(),
			});
		});
	}, [addToast]);

	const handleSave = useCallback(() => {
		save();
		addToast("toast.file_saved");
	}, [save, data]);

	const handleDisableDevice = useCallback(async () => {
		const result = await window.api.disableDevice(
			localStorage.getItem("licenseKey"),
		);
		setShowDisableConfirm(false);
		if (result.success) {
			localStorage.removeItem("licenseKey");
			window.location.reload();
		}
	}, []);

	useEffect(() => {
		if (filePath === null) {
			navigate("/", { replace: true });
		}
	}, [filePath, navigate]);

	return (
		<div className={`app ${mode}`}>
			<div className="app-layout">
				<div className="app-header">
					<div style={{ display: "flex", alignItems: "center" }}>
						<img style={{ width: 40, marginRight: 10 }} src={logo} alt="Logo" />
					</div>
					<div className="right">
						<button type="button" onClick={toggleDarkMode}>
							<TextItem path={"layout.mode"} />
						</button>
						{filePath && (
							<>
								<button type="button" onClick={handleSave}>
									<TextItem path={"layout.save"} />
								</button>
								<button
									type="button"
									onClick={() => {
										back();
									}}
								>
									<TextItem path={"layout.home"} />
								</button>
							</>
						)}
						<select
							className="select-lang"
							value={lg}
							onChange={(e) => setLg(e?.target?.value)}
						>
							<option value="fr">FR</option>
							<option value="nl">NL</option>
							<option value="en">EN</option>
						</select>
					</div>
				</div>
				<div className="core">
					<div className="layout-menu">
						{filePath ? (
							<div className="menu">
								<LinkItem to="/infog">
									<TextItem path={"nav.info_general"} />
								</LinkItem>
								<DetectMissingData data={data} required={[]}>
									<LinkItem to="/frais">
										<TextItem path={"nav.frais"} />
									</LinkItem>
								</DetectMissingData>
								<div className="sub-nav">
									<DetectMissingData
										data={data}
										required={[
											{
												value: "general_info.date_naissance",
												label: "common.date_naissance",
											},
											{ value: "general_info.sexe", label: "common.sexe" },
										]}
									>
										<SubNavTitle
											onClick={() => setIncTemp(!incTemp)}
											path="nav.incapacite_temp"
										/>
										{incTemp && (
											<div>
												<LinkItem
													errors={errors}
													to="/it/personnel"
													name="incapacite_temp_personnel"
												>
													<TextItem path={"nav.incapacite_temp.personnel"} />
												</LinkItem>
												<LinkItem
													to="/it/menagère"
													errors={errors}
													name="incapacite_temp_menagere"
												>
													<TextItem path={"nav.incapacite_temp.menagère"} />
												</LinkItem>
												<LinkItem
													to="/it/economique"
													errors={errors}
													name="incapacite_temp_economique"
												>
													<TextItem path={"nav.incapacite_temp.economique"} />
												</LinkItem>
												<LinkItem
													to="/it/effa"
													errors={errors}
													name="efforts_accrus"
												>
													<TextItem path={"nav.incapacite_temp.effa"} />
												</LinkItem>
												<LinkItem
													to="/it/hosp"
													errors={errors}
													name="hospitalisation"
												>
													<TextItem
														path={"nav.incapacite_temp.hospitalisation"}
													/>
												</LinkItem>
												<LinkItem
													to="/it/pretium"
													errors={errors}
													name="pretium_doloris"
												>
													<TextItem path={"nav.incapacite_temp.pretium"} />
												</LinkItem>
											</div>
										)}
									</DetectMissingData>
								</div>
								<div className="sub-nav">
									<DetectMissingData
										data={data}
										required={[
											{
												value: "general_info.date_naissance",
												label: "common.date_naissance",
											},
											{
												value: "general_info.date_consolidation",
												label: "common.date_consolidation",
											},
											{ value: "general_info.sexe", label: "common.sexe" },
										]}
									>
										<SubNavTitle
											onClick={() => setIncPerma(!incPerma)}
											path="nav.incapacite_perma"
										/>
										{incPerma && (
											<div>
												<DetectMissingData
													data={data}
													required={[
														{
															label: "errors.method_forfait",
															function: () =>
																Object.values(data?.general_info?.ip)?.filter(
																	(it) => it?.method === "forfait",
																)?.length !== 0,
														},
													]}
												>
													<LinkItem to="/ip/forfait">
														<TextItem path={"nav.incapacite_perma.forfait"} />
													</LinkItem>
												</DetectMissingData>
												<DetectMissingData
													data={data}
													required={[
														{
															value: "general_info.ip.personnel.method",
															eq: "capitalized",
															label: "errors.method_capitalized",
														},
														{
															value: "general_info.ip.personnel.interet",
															label: "info_general.incapacite_perma.interet",
														},
													]}
												>
													<LinkItem to="/ip/personnel">
														<TextItem
															path={"nav.incapacite_perma.personnel_cap"}
														/>
													</LinkItem>
												</DetectMissingData>
												<DetectMissingData
													data={data}
													required={[
														{
															value: "general_info.ip.menagere.method",
															eq: "capitalized",
															label: "errors.method_capitalized",
														},
														{
															value: "general_info.ip.menagere.interet",
															label: "info_general.incapacite_perma.interet",
														},
													]}
												>
													<LinkItem to="/ip/menagère">
														<TextItem
															path={"nav.incapacite_perma.menagère_cap"}
														/>
													</LinkItem>
												</DetectMissingData>
												<DetectMissingData
													data={data}
													required={[
														{
															value: "general_info.ip.economique.method",
															eq: "capitalized",
															label: "errors.method_capitalized",
														},
														{
															value: "general_info.ip.economique.interet",
															label: "info_general.incapacite_perma.interet",
														},
													]}
												>
													<LinkItem to="/ip/economique">
														<TextItem
															path={"nav.incapacite_perma.economique_cap"}
														/>
													</LinkItem>
												</DetectMissingData>
												<LinkItem to="/ip/frais">
													<TextItem
														path={"nav.incapacite_perma.frais_futurs"}
													/>
												</LinkItem>
												<LinkItem to="/ip/particuliers">
													<TextItem
														path={"nav.incapacite_perma.préjudices_part"}
													/>
												</LinkItem>
											</div>
										)}
									</DetectMissingData>
								</div>
								<div className="sub-nav">
									<DetectMissingData
										data={data}
										required={[
											{
												value: "general_info.date_naissance",
												label: "common.date_naissance",
											},
											{
												value: "general_info.date_death",
												label: "common.date_death",
											},
											{ value: "general_info.sexe", label: "common.sexe" },
										]}
									>
										<SubNavTitle
											onClick={() => setDead(!dead)}
											path="nav.deces"
										/>
										{dead && (
											<div>
												<LinkItem to="/deces/frais">
													<TextItem path={"nav.deces.frais"} />
												</LinkItem>
												<LinkItem to="/deces/prejudice_exh">
													<TextItem path={"nav.deces.prejudice_exh"} />
												</LinkItem>
												<LinkItem to="/deces/prejudice_proche">
													<TextItem path={"nav.deces.prejudice_proche"} />
												</LinkItem>
											</div>
										)}
									</DetectMissingData>
								</div>
								<div>
									<LinkItem errors={errors} to="/provisions" name="provisions">
										<TextItem path={"nav.provisions"} />
									</LinkItem>
								</div>
								<div>
									<LinkItem to="/recap">
										<TextItem path={"nav.recap"} />
									</LinkItem>
								</div>
							</div>
						) : (
							<RecentFilesList />
						)}
						<div className="menu-bottom">
							<button
								style={{ fontSize: 10, margin: 0 }}
								onClick={() => {
									setUpdateCheck(true);
									window.api.checkForUpdates();
								}}
								type="button"
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										position: "relative",
									}}
								>
									<TextItem path={"layout.maj"} />
									{updateCheck && (
										<Loader
											style={{
												width: 20,
												height: 20,
												marginTop: -10,
												marginBottom: -10,
												marginRight: -5,
											}}
										/>
									)}
								</div>
							</button>
							<button
								style={{
									fontSize: 10,
									marginTop: 10,
									marginBottom: 5,
									borderColor: "red",
								}}
								onClick={() => {
									setShowDisableConfirm(true);
								}}
								type="button"
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										position: "relative",
										color: "red",
									}}
								>
									<TextItem path={"layout.disable_device"} />
								</div>
							</button>
							<div style={{ padding: 5 }}>
								{import.meta.env.VITE_APP_VERSION}
							</div>
						</div>
					</div>
					<div
						className={`content ${data?.general_info?.calcul_interets !== "true" && "contentWithOutInteret"}`}
					>
						<div className={"scroll"}>
							<Outlet />
						</div>
					</div>
				</div>
			</div>

			{/* Popup de confirmation pour disable device */}
			{showDisableConfirm && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 1000,
					}}
					onClick={() => setShowDisableConfirm(false)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							setShowDisableConfirm(false);
						}
					}}
					tabIndex={0}
					role="button"
				>
					<div
						style={{
							backgroundColor: mode === "dark" ? "#2d2d2d" : "#fff",
							padding: "20px",
							borderRadius: "8px",
							minWidth: "300px",
							maxWidth: "500px",
							color: mode === "dark" ? "#fff" : "#000",
							boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
						}}
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.stopPropagation();
							}
						}}
						tabIndex={0}
						role="button"
					>
						<h3 style={{ margin: "0 0 15px 0", fontSize: "18px" }}>
							<TextItem path="layout.disable_device_confirm_title" />
						</h3>
						<p style={{ margin: "0 0 20px 0", lineHeight: "1.5" }}>
							<TextItem path="layout.disable_device_confirm_message" />
						</p>
						<div
							style={{
								display: "flex",
								gap: "10px",
								justifyContent: "flex-end",
							}}
						>
							<button
								type="button"
								style={{
									padding: "8px 16px",
									border: "1px solid #ccc",
									borderRadius: "4px",
									backgroundColor: mode === "dark" ? "#404040" : "#f5f5f5",
									color: mode === "dark" ? "#fff" : "#000",
									cursor: "pointer",
								}}
								onClick={() => setShowDisableConfirm(false)}
							>
								<TextItem path="layout.cancel" />
							</button>
							<button
								type="button"
								style={{
									padding: "8px 16px",
									border: "1px solid #dc3545",
									borderRadius: "4px",
									backgroundColor: "#dc3545",
									color: "#fff",
									cursor: "pointer",
								}}
								onClick={handleDisableDevice}
							>
								<TextItem path="layout.confirm" />
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AppLayout;
