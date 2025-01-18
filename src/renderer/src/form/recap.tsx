

import EconomiqueCap from './incapacite_perma/economique_cap';
import Forfait from './incapacite_perma/forfait';
import FraisCap from './incapacite_perma/frais_cap';
import MenageCap from './incapacite_perma/menage_cap';
import PersonnelCap from './incapacite_perma/personnel_cap';
import PrejudiceParticulier from './incapacite_perma/prejudice_particulier';

import Economique from './incapacite_temp/economique';
import EffortAccru from './incapacite_temp/effort_accru';
import Hospitalisation from './incapacite_temp/hospitalisation';
import Menagere from './incapacite_temp/menagère';
import Personnel from './incapacite_temp/personnel';
import PretiumDoloris from './incapacite_temp/pretium_doloris';

import FraisForm from './frais_form';
import InfoGeneralForm from './info_general_form';

const AllForms = () => {
  return (
    <div>
      <h1>Récapitulatif</h1>
      <InfoGeneralForm onSubmit={undefined} initialValues={undefined} />
      <FraisForm onSubmit={undefined} initialValues={undefined} />
      <Personnel initialValues={undefined} onSubmit={undefined} />
      <Menagere initialValues={undefined} onSubmit={undefined} />
      <Economique initialValues={undefined} onSubmit={undefined} />
      <EffortAccru initialValues={undefined} onSubmit={undefined} />
      <Hospitalisation initialValues={undefined} onSubmit={undefined} />
      <PretiumDoloris initialValues={undefined} onSubmit={undefined} />
      <Forfait onSubmit={undefined} initialValues={undefined} />
      <PersonnelCap onSubmit={undefined} initialValues={undefined} />
      <MenageCap onSubmit={undefined} initialValues={undefined} />
      <EconomiqueCap onSubmit={undefined} initialValues={undefined} />
      <FraisCap initialValues={undefined} onSubmit={undefined} />
      <PrejudiceParticulier initialValues={undefined} onSubmit={undefined} />
    </div>
  );
};

export default AllForms;