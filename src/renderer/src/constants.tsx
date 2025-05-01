export default {
  sexe: [
    { label: 'Homme', value: 'homme' },
    { label: 'Femme', value: 'femme' }
  ],
  marital_status: [
    { label: 'Marié', value: 'marié' },
    { label: 'Célibataire', value: 'célibataire' }
  ],
  profession: [
    { value: 'employe', label: 'Employé' },
    { value: 'ouvrier', label: 'Ouvrier' },
    { value: 'sans_emploi', label: 'Sans emploi' },
    { value: 'retraite', label: 'Retraité' },
    { value: 'independant', label: 'Indépendant' },
    { value: 'fonctionnaire', label: 'Fonctionnaire' },
    { value: 'invalide', label: 'Invalide' }
  ],
  contribution: [
    { value: 0, label: '0%' },
    { value: 35, label: '35%' },
    { value: 50, label: '50%' },
    { value: 65, label: '65%' },
    { value: 100, label: '100%' }
  ],
  boolean: [
    { label: 'Oui', value: true },
    { label: 'Non', value: false }
  ],
  deplacement_type: [
    { value: 0.42, label: 'Véhicule automobile' },
    { value: 0.28, label: 'Autre' }
  ],
  reference_menage_children: [
    { value: 'rente_certaine_an', label: 'VA rente certaine 1€/an paiements MENSUELS' },
    { value: 'rente_certaine_mois', label: 'VA rente certaine 1€/an paiements ANNUELS' }
    // { value: 'an', label: 'VA rente viagère 1€/an payable mensuellement' },
    // { value: 'mois', label: 'VA rente viagère 1€/an payable annuellement' }
  ],
  reference_light: [
    { value: 'an', label: 'VA rente viagère 1€/an payable mensuellement' },
    { value: 'mois', label: 'VA rente viagère 1€/an payable annuellement' },
    {
      value: 'esp_vie_mois',
      label:
        "VA rente certaine 1€/an durée égale à l'espérance de vie prospective paiements MENSUELS"
    },
    {
      value: 'esp_vie_an',
      label:
        "VA rente certaine 1€/an durée égale à l'espérance de vie prospective paiements ANNUELS"
    },
    {
      value: 'vie_med_mois',
      label:
        'VA rente certaine 1€/an durée égale à la durée de vie médiane prospective paiements MENSUELS'
    },
    {
      value: 'vie_med_an',
      label:
        'VA rente certaine 1€/an durée égale à la durée de vie médiane prospective paiements ANNUELS'
    }
  ],
  reference: [
    // par année
    { value: '55_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (55 ans)' },
    { value: '56_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (56 ans)' },
    { value: '57_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (57 ans)' },
    { value: '58_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (58 ans)' },
    { value: '59_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (59 ans)' },
    { value: '60_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (60 ans)' },
    { value: '61_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (61 ans)' },
    { value: '62_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (62 ans)' },
    { value: '63_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (63 ans)' },
    { value: '64_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (64 ans)' },
    { value: '65_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (65 ans)' },
    { value: '66_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (66 ans)' },
    { value: '67_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (67 ans)' },
    { value: '68_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (68 ans)' },
    { value: '69_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (69 ans)' },
    { value: '70_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (70 ans)' },
    { value: '71_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (71 ans)' },
    { value: '72_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (72 ans)' },
    { value: '73_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (73 ans)' },
    { value: '74_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (74 ans)' },
    { value: '75_an', label: 'VA rente viagère temporaire 1€/an payable annuellement (75 ans)' },
    // par mois
    { value: '55_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (55 ans)' },
    { value: '56_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (56 ans)' },
    { value: '57_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (57 ans)' },
    { value: '58_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (58 ans)' },
    { value: '59_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (59 ans)' },
    { value: '60_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (60 ans)' },
    { value: '61_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (61 ans)' },
    { value: '62_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (62 ans)' },
    { value: '63_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (63 ans)' },
    { value: '64_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (64 ans)' },
    { value: '65_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (65 ans)' },
    { value: '66_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (66 ans)' },
    { value: '67_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (67 ans)' },
    { value: '68_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (68 ans)' },
    { value: '69_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (69 ans)' },
    { value: '70_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (70 ans)' },
    { value: '71_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (71 ans)' },
    { value: '72_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (72 ans)' },
    { value: '73_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (73 ans)' },
    { value: '74_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (74 ans)' },
    { value: '75_mois', label: 'VA rente viagère temporaire 1€/an payable mensuellement (75 ans)' }
  ],
  interet_amount: [
    { value: 0.5, label: '0.5%' },
    { value: 0.8, label: '0.8%' },
    { value: 1, label: '1%' },
    { value: 1.5, label: '1.5%' },
    { value: 2, label: '2%' },
    { value: 3, label: '3%' }
  ],
  family_link: [
    { value: 'partenaire', label: 'Partenaire [€ 15.000 - € 45.000]' },
    { value: 'parent/enfant', label: 'Parent/Enfant [€ 15.000 - € 45.000]' },
    { value: 'frère/soeur', label: 'Frère/Soeur [€ 7.500 - € 25.000]' },
    { value: 'grand_parent/petit_enfant', label: 'Grand-parent/Petit-enfant [€ 7.500 - € 25.000]' },
    { value: 'fausse_couche', label: 'Fausse couche [€ 3.000 - € 9.000]' }
  ],
  zeroToFifty: [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
    { label: '7', value: 7 },
    { label: '8', value: 8 },
    { label: '9', value: 9 },
    { label: '10', value: 10 },
    { label: '11', value: 11 },
    { label: '12', value: 12 },
    { label: '13', value: 13 },
    { label: '14', value: 14 },
    { label: '15', value: 15 },
    { label: '16', value: 16 },
    { label: '17', value: 17 },
    { label: '18', value: 18 },
    { label: '19', value: 19 },
    { label: '20', value: 20 },
    { label: '21', value: 21 },
    { label: '22', value: 22 },
    { label: '23', value: 23 },
    { label: '24', value: 24 },
    { label: '25', value: 25 },
    { label: '26', value: 26 },
    { label: '27', value: 27 },
    { label: '28', value: 28 },
    { label: '29', value: 29 },
    { label: '30', value: 30 },
    { label: '31', value: 31 },
    { label: '32', value: 32 },
    { label: '33', value: 33 },
    { label: '34', value: 34 },
    { label: '35', value: 35 },
    { label: '36', value: 36 },
    { label: '37', value: 37 },
    { label: '38', value: 38 },
    { label: '39', value: 39 },
    { label: '40', value: 40 },
    { label: '41', value: 41 },
    { label: '42', value: 42 },
    { label: '43', value: 43 },
    { label: '44', value: 44 },
    { label: '45', value: 45 },
    { label: '46', value: 46 },
    { label: '47', value: 47 },
    { label: '48', value: 48 },
    { label: '49', value: 49 },
    { label: '50', value: 50 }
  ]
}
