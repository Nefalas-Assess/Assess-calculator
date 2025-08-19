export default {
	sexe: [
		{ label: { fr: "Homme", en: "Man", nl: "Man" }, value: "homme" },
		{ label: { fr: "Femme", en: "Woman", nl: "Vrouw" }, value: "femme" },
	],
	marital_status: [
		{ label: { fr: "Marié(e)", en: "Married", nl: "Gehuwd" }, value: "marié" },
		{
			label: { fr: "Célibataire", en: "Single", nl: "Ongehuwd" },
			value: "célibataire",
		},
	],
	profession: [
		{
			value: "employe",
			label: { fr: "Employé(e)", en: "Employee", nl: "Werknemer" },
		},
		{
			value: "ouvrier",
			label: { fr: "Ouvrier / Ouvrière", en: "Worker", nl: "Arbeider" },
		},
		{
			value: "sans_emploi",
			label: { fr: "Sans emploi", en: "Unemployed", nl: "Ziektewet" },
		},
		{
			value: "retraite",
			label: { fr: "Retraité(e)", en: "Retired", nl: "Ouderenwet" },
		},
		{
			value: "independant",
			label: { fr: "Indépendant(e)", en: "Independent", nl: "Zelfstandig" },
		},
		{
			value: "fonctionnaire",
			label: { fr: "Fonctionnaire", en: "Functionary", nl: "Ambtenaar" },
		},
		{
			value: "étudiant",
			label: { fr: "Étudiant(e)", en: "Student", nl: "Student" },
		},
		{
			value: "invalide",
			label: { fr: "Invalide", en: "Invalid", nl: "Invalidenwet" },
		},
	],
	method_incapacite_perma: [
		{
			value: "forfait",
			label: { fr: "Forfait", en: "Lump sum", nl: "Forfait" },
		},
		{
			value: "capitalized",
			label: { fr: "Capitalisé", en: "Capitalized", nl: "Capitalisé" },
		},
	],
	contribution: [
		{ value: 0, label: "0%" },
		{ value: 5, label: "5%" },
		{ value: 10, label: "10%" },
		{ value: 15, label: "15%" },
		{ value: 20, label: "20%" },
		{ value: 25, label: "25%" },
		{ value: 30, label: "30%" },
		{ value: 35, label: "35%" },
		{ value: 40, label: "40%" },
		{ value: 45, label: "45%" },
		{ value: 50, label: "50%" },
		{ value: 55, label: "55%" },
		{ value: 60, label: "60%" },
		{ value: 65, label: "65%" },
		{ value: 70, label: "70%" },
		{ value: 75, label: "75%" },
		{ value: 80, label: "80%" },
		{ value: 85, label: "85%" },
		{ value: 90, label: "90%" },
		{ value: 95, label: "95%" },
		{ value: 100, label: "100%" },
	],
	boolean: [
		{ label: { fr: "Oui", en: "Yes", nl: "Ja" }, value: true },
		{ label: { fr: "Non", en: "No", nl: "Nee" }, value: false },
	],
	deplacement_type: [
		{
			value: 0.42,
			label: { fr: "Véhicule automobile", en: "Car", nl: "Auto" },
		},
		{ value: 0.28, label: { fr: "Autre", en: "Other", nl: "Ander" } },
	],
	reference_type: [
		{ value: "schryvers_2024", label: "Schryvers 2024" },
		{ value: "schryvers_2025", label: "Schryvers 2025" },
	],
	reference_menage_children: [
		{
			value: "rente_certaine_an",
			label: {
				fr: "Valeur actuelle de la rente certaine de 1€ par an paiements mensuels",
				en: "Present value of an assured annuity of 1 euro per year payments monthly",
				nl: "Huidige waarde van een zekere rente van 1 euro per jaar met maandelijkse betalingen",
			},
		},
		{
			value: "rente_certaine_mois",
			label: {
				fr: "Valeur actuelle d'une rente certaine de 1€ par an paiements annuels",
				en: "Present value of an assured annuity of 1 euro per year payments annually",
				nl: "Huidige waarde van een zekere rente van 1 euro per jaar met jaarlijkse betalingen",
			},
		},
	],
	reference_light: [
		{
			value: "mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère de 1€ par an paiements mensuels",
				en: "Present value of a life annuity of 1 euro per year payable monthly",
				nl: "Huidige waarde van een lijfrente van 1 euro per jaar met maandelijkse betalingen",
			},
		},
		{
			value: "an",
			label: {
				fr: "Valeur actuelle d'une rente viagère de 1€ par an paiements annuels",
				en: "Present value of a life annuity of 1 euro per year payable annually",
				nl: "Huidige waarde van een lijfrente van 1 euro per jaar met jaarlijkse betalingen",
			},
		},
		{
			value: "esp_vie_mois",
			label: {
				fr: "Valeur actuelle d'une rente certaine de 1€ par an durée égale à l'espérance de vie prospective paiements mensuels",
				en: "Present value of an assured annuity of 1 euro per year duration equal to the expected life expectancy of prospective monthly payments",
				nl: "Huidige waarde van een zekere rente van 1 euro per jaar duur gelijk aan de verwachte levensverwachting van maandelijkse betalingen",
			},
		},
		{
			value: "esp_vie_an",
			label: {
				fr: "Valeur actuelle d'une rente certaine de 1€ par an durée égale à l'espérance de vie prospective paiements annuels",
				en: "Present value of an assured annuity of 1 euro per year duration equal to the expected life expectancy of prospective annual payments",
				nl: "Huidige waarde van een zekere rente van 1 euro per jaar duur gelijk aan de verwachte levensverwachting van jaarlijkse betalingen",
			},
		},
		{
			value: "vie_med_mois",
			label: {
				fr: "Valeur actuelle d'une rente certaine de 1€ par an durée égale à la durée de vie médiane prospective paiements mensuels",
				en: "Present value of an assured annuity of 1 euro per year duration equal to the expected median life expectancy of prospective monthly payments",
				nl: "Huidige waarde van een zekere rente van 1 euro per jaar duur gelijk aan de verwachte mediane levensverwachting van maandelijkse betalingen",
			},
		},
		{
			value: "vie_med_an",
			label: {
				fr: "Valeur actuelle d'une rente certaine de 1€ par an durée égale à la durée de vie médiane prospective paiements annuels",
				en: "Present value of an assured annuity of 1 euro per year duration equal to the expected median life expectancy of prospective annual payments",
				nl: "Huidige waarde van een zekere rente van 1 euro per jaar duur gelijk aan de verwachte mediane levensverwachting van jaarlijkse betalingen",
			},
		},
	],
	reference: [
		// par année
		{
			value: "55_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (55 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (55 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (55 jaar)",
			},
		},
		{
			value: "56_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (56 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (56 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (56 jaar)",
			},
		},
		{
			value: "57_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (57 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (57 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (57 jaar)",
			},
		},
		{
			value: "58_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (58 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (58 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (58 jaar)",
			},
		},
		{
			value: "59_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (59 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (59 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (59 jaar)",
			},
		},
		{
			value: "60_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (60 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (60 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (60 jaar)",
			},
		},
		{
			value: "61_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (61 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (61 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (61 jaar)",
			},
		},
		{
			value: "62_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (62 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (62 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (62 jaar)",
			},
		},
		{
			value: "63_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (63 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (63 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (63 jaar)",
			},
		},
		{
			value: "64_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (64 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (64 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (64 jaar)",
			},
		},
		{
			value: "65_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (65 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (65 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (65 jaar)",
			},
		},
		{
			value: "66_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (66 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (66 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (66 jaar)",
			},
		},
		{
			value: "67_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (67 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (67 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (67 jaar)",
			},
		},
		{
			value: "68_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (68 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (68 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (68 jaar)",
			},
		},
		{
			value: "69_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (69 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (69 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (69 jaar)",
			},
		},
		{
			value: "70_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (70 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (70 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (70 jaar)",
			},
		},
		{
			value: "71_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (71 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (71 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (71 jaar)",
			},
		},
		{
			value: "72_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (72 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (72 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (72 jaar)",
			},
		},
		{
			value: "73_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (73 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (73 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (73 jaar)",
			},
		},
		{
			value: "74_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (74 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (74 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (74 jaar)",
			},
		},
		{
			value: "75_an",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable annuellement (75 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable annually (75 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met jaarlijkse betalingen (75 jaar)",
			},
		},
		// par mois
		{
			value: "55_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (55 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (55 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (55 jaar)",
			},
		},
		{
			value: "56_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (56 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (56 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (56 jaar)",
			},
		},
		{
			value: "57_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (57 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (57 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (57 jaar)",
			},
		},
		{
			value: "58_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (58 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (58 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (58 jaar)",
			},
		},
		{
			value: "59_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (59 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (59 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (59 jaar)",
			},
		},
		{
			value: "60_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (60 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (60 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (60 jaar)",
			},
		},
		{
			value: "61_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (61 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (61 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (61 jaar)",
			},
		},
		{
			value: "62_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (62 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (62 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (62 jaar)",
			},
		},
		{
			value: "63_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (63 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (63 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (63 jaar)",
			},
		},
		{
			value: "64_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (64 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (64 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (64 jaar)",
			},
		},
		{
			value: "65_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (65 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (65 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (65 jaar)",
			},
		},
		{
			value: "66_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (66 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (66 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (66 jaar)",
			},
		},
		{
			value: "67_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (67 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (67 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (67 jaar)",
			},
		},
		{
			value: "68_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (68 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (68 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (68 jaar)",
			},
		},
		{
			value: "69_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (69 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (69 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (69 jaar)",
			},
		},
		{
			value: "70_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (70 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (70 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (70 jaar)",
			},
		},
		{
			value: "71_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (71 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (71 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (71 jaar)",
			},
		},
		{
			value: "72_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (72 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (72 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (72 jaar)",
			},
		},
		{
			value: "73_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (73 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (73 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (73 jaar)",
			},
		},
		{
			value: "74_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (74 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (74 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (74 jaar)",
			},
		},
		{
			value: "75_mois",
			label: {
				fr: "Valeur actuelle d'une rente viagère temporaire de 1€/an payable mensuellement (75 ans)",
				en: "Present value of a temporary life annuity of 1 euro per year payable monthly (75 years)",
				nl: "Huidige waarde van een tijdelijke levensrente van 1 euro per jaar met maandelijkse betalingen (75 jaar)",
			},
		},
	],
	interet_amount: [
		{ value: 0.5, label: "0.5%" },
		{ value: 0.8, label: "0.8%" },
		{ value: 1, label: "1%" },
		{ value: 1.5, label: "1.5%" },
		{ value: 2, label: "2%" },
		{ value: 3, label: "3%" },
	],
	family_link: [
		{
			value: "partenaire",
			label: {
				fr: "Partenaire [€ 15.000 - € 45.000]",
				en: "Partner [€ 15.000 - € 45.000]",
				nl: "Partner [€ 15.000 - € 45.000]",
			},
		},
		{
			value: "parent/enfant",
			label: {
				fr: "Parent/Enfant [€ 15.000 - € 45.000]",
				en: "Parent/Child [€ 15.000 - € 45.000]",
				nl: "Ouder/Kind [€ 15.000 - € 45.000]",
			},
		},
		{
			value: "frère/soeur",
			label: {
				fr: "Frère/Soeur [€ 7.500 - € 25.000]",
				en: "Brother/Sister [€ 7.500 - € 25.000]",
				nl: "Broer/Zus [€ 7.500 - € 25.000]",
			},
		},
		{
			value: "grand_parent/petit_enfant",
			label: {
				fr: "Grand-parent/Petit-enfant [€ 7.500 - € 25.000]",
				en: "Grandparent/Grandchild [€ 7.500 - € 25.000]",
				nl: "Grootouder/Kleinkind [€ 7.500 - € 25.000]",
			},
		},
		{
			value: "fausse_couche",
			label: {
				fr: "Fausse couche [€ 3.000 - € 9.000]",
				en: "False pregnancy [€ 3.000 - € 9.000]",
				nl: "Valse zwangerschap [€ 3.000 - € 9.000]",
			},
		},
	],
	zeroToFifty: [
		{ label: "1", value: 1 },
		{ label: "2", value: 2 },
		{ label: "3", value: 3 },
		{ label: "4", value: 4 },
		{ label: "5", value: 5 },
		{ label: "6", value: 6 },
		{ label: "7", value: 7 },
		{ label: "8", value: 8 },
		{ label: "9", value: 9 },
		{ label: "10", value: 10 },
		{ label: "11", value: 11 },
		{ label: "12", value: 12 },
		{ label: "13", value: 13 },
		{ label: "14", value: 14 },
		{ label: "15", value: 15 },
		{ label: "16", value: 16 },
		{ label: "17", value: 17 },
		{ label: "18", value: 18 },
		{ label: "19", value: 19 },
		{ label: "20", value: 20 },
		{ label: "21", value: 21 },
		{ label: "22", value: 22 },
		{ label: "23", value: 23 },
		{ label: "24", value: 24 },
		{ label: "25", value: 25 },
		{ label: "26", value: 26 },
		{ label: "27", value: 27 },
		{ label: "28", value: 28 },
		{ label: "29", value: 29 },
		{ label: "30", value: 30 },
		{ label: "31", value: 31 },
		{ label: "32", value: 32 },
		{ label: "33", value: 33 },
		{ label: "34", value: 34 },
		{ label: "35", value: 35 },
		{ label: "36", value: 36 },
		{ label: "37", value: 37 },
		{ label: "38", value: 38 },
		{ label: "39", value: 39 },
		{ label: "40", value: 40 },
		{ label: "41", value: 41 },
		{ label: "42", value: 42 },
		{ label: "43", value: 43 },
		{ label: "44", value: 44 },
		{ label: "45", value: 45 },
		{ label: "46", value: 46 },
		{ label: "47", value: 47 },
		{ label: "48", value: 48 },
		{ label: "49", value: 49 },
		{ label: "50", value: 50 },
	],
};
