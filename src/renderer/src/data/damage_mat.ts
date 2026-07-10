type DamageMatLabel = {
  fr: string
  en: string
  nl: string
}

type DamageMatVehicle = {
  value: string
  label: DamageMatLabel
  configKey: string
  defaultRate: number
  perUnitKey?: string
  perUnitDefault?: number
  unitLabel?: DamageMatLabel
}

export const DAMAGE_MAT_VEHICLES: DamageMatVehicle[] = [
  {
    value: 'bicycle',
    label: {
      fr: 'Bicyclette (avec/sans assistance, max. 25 km/h)',
      en: 'Bicycle (with/without assistance, max. 25 km/h)',
      nl: 'Fiets (met/zonder ondersteuning, max. 25 km/u)'
    },
    configKey: 'damage_mat_bicycle',
    defaultRate: 12
  },
  {
    value: 'motor_two_wheels',
    label: {
      fr: '2 ou 3 roues motorisées, quad et speed pédélec',
      en: '2 or 3 motorized wheels, quad and speed pedelec',
      nl: '2 of 3 gemotoriseerde wielen, quad en speed pedelec'
    },
    configKey: 'damage_mat_motor_two_wheels',
    defaultRate: 17
  },
  {
    value: 'trailer_under_750',
    label: {
      fr: 'Remorque de voiture de moins de 750 kg',
      en: 'Car trailer under 750 kg',
      nl: 'Autotrailer van minder dan 750 kg'
    },
    configKey: 'damage_mat_trailer_under_750',
    defaultRate: 12
  },
  {
    value: 'trailer_over_750',
    label: {
      fr: 'Remorque de voiture de plus de 750 kg',
      en: 'Car trailer over 750 kg',
      nl: 'Autotrailer van meer dan 750 kg'
    },
    configKey: 'damage_mat_trailer_over_750',
    defaultRate: 17
  },
  {
    value: 'car',
    label: {
      fr: 'Voiture (également usage professionnel et leasing)',
      en: 'Car (including professional use and leasing)',
      nl: 'Auto (ook professioneel gebruik en leasing)'
    },
    configKey: 'damage_mat_car',
    defaultRate: 23
  },
  {
    value: 'mobile_home',
    label: {
      fr: 'Mobilhome',
      en: 'Mobile home',
      nl: 'Mobilhome'
    },
    configKey: 'damage_mat_mobile_home',
    defaultRate: 58
  },
  {
    value: 'taxi_company',
    label: {
      fr: 'Taxi grandes entreprises',
      en: 'Taxi large companies',
      nl: 'Taxi grote ondernemingen'
    },
    configKey: 'damage_mat_taxi_company',
    defaultRate: 58
  },
  {
    value: 'taxi_independent',
    label: {
      fr: 'Taxi exploitant indépendant',
      en: 'Taxi independent operator',
      nl: 'Taxi zelfstandige exploitant'
    },
    configKey: 'damage_mat_taxi_independent',
    defaultRate: 69
  },
  {
    value: 'rental_car',
    label: {
      fr: 'Voiture de location (hors leasing)',
      en: 'Rental car (excluding leasing)',
      nl: 'Huurwagen (zonder leasing)'
    },
    configKey: 'damage_mat_rental_car',
    defaultRate: 53
  },
  {
    value: 'van_small_truck',
    label: {
      fr: 'Camionnettes et petits camions',
      en: 'Vans and small trucks',
      nl: 'Bestelwagens en kleine vrachtwagens'
    },
    configKey: 'damage_mat_van_small_truck',
    defaultRate: 46
  },
  {
    value: 'truck_over_3_5',
    label: {
      fr: 'Camions et véhicules tractés dès 3,5 t (base + supplément/tonne)',
      en: 'Trucks and towed vehicles from 3.5 t (base + supplement/ton)',
      nl: 'Vrachtwagens en getrokken voertuigen vanaf 3,5 t (basis + toeslag/ton)'
    },
    configKey: 'damage_mat_truck_base',
    defaultRate: 58,
    perUnitKey: 'damage_mat_truck_per_tonne',
    perUnitDefault: 12,
    unitLabel: {
      fr: 'Tonnage net',
      en: 'Net tonnage',
      nl: 'Netto tonnage'
    }
  },
  {
    value: 'single_truck_owner',
    label: {
      fr: "Propriétaire d'un seul camion",
      en: 'Owner of a single truck',
      nl: 'Eigenaar van één vrachtwagen'
    },
    configKey: 'damage_mat_single_truck_owner',
    defaultRate: 72
  },
  {
    value: 'heavy_special_vehicle',
    label: {
      fr: 'Véhicules lourds spécialisés',
      en: 'Specialized heavy vehicles',
      nl: 'Gespecialiseerde zware voertuigen'
    },
    configKey: 'damage_mat_special_heavy_vehicle',
    defaultRate: 173
  },
  {
    value: 'ambulance',
    label: {
      fr: 'Ambulance',
      en: 'Ambulance',
      nl: 'Ambulance'
    },
    configKey: 'damage_mat_ambulance',
    defaultRate: 100
  },
  {
    value: 'caravan_trailer',
    label: {
      fr: 'Remorque de camping / caravane',
      en: 'Camping trailer / caravan',
      nl: 'Kampeertrailer / caravan'
    },
    configKey: 'damage_mat_caravan_trailer',
    defaultRate: 28
  },
  {
    value: 'bus_under_31',
    label: {
      fr: 'Autobus / autocar < 31 places',
      en: 'Bus / coach < 31 seats',
      nl: 'Autobus / autocar < 31 zitplaatsen'
    },
    configKey: 'damage_mat_bus_under_31',
    defaultRate: 58
  },
  {
    value: 'bus_31_38',
    label: {
      fr: 'Autobus / autocar 31 à 37 places',
      en: 'Bus / coach 31 to 37 seats',
      nl: 'Autobus / autocar 31 tot 37 zitplaatsen'
    },
    configKey: 'damage_mat_bus_31_38',
    defaultRate: 103
  },
  {
    value: 'bus_38_44',
    label: {
      fr: 'Autobus / autocar 38 à 43 places',
      en: 'Bus / coach 38 to 43 seats',
      nl: 'Autobus / autocar 38 tot 43 zitplaatsen'
    },
    configKey: 'damage_mat_bus_38_44',
    defaultRate: 132
  },
  {
    value: 'bus_44_50',
    label: {
      fr: 'Autobus / autocar 44 à 49 places',
      en: 'Bus / coach 44 to 49 seats',
      nl: 'Autobus / autocar 44 tot 49 zitplaatsen'
    },
    configKey: 'damage_mat_bus_44_50',
    defaultRate: 161
  },
  {
    value: 'bus_over_50',
    label: {
      fr: 'Autobus / autocar ≥ 50 places',
      en: 'Bus / coach ≥ 50 seats',
      nl: 'Autobus / autocar ≥ 50 zitplaatsen'
    },
    configKey: 'damage_mat_bus_over_50',
    defaultRate: 207
  }
]

export const getDamageMatVehicleConfigDefaults = (): Record<string, number> =>
  DAMAGE_MAT_VEHICLES.reduce((acc, vehicle) => {
    acc[vehicle.configKey] = vehicle.defaultRate
    if (vehicle.perUnitKey) {
      acc[vehicle.perUnitKey] = vehicle.perUnitDefault
    }
    return acc
  }, {})

export const getDamageMatVehicleRate = (
  config: Record<string, number> | undefined,
  vehicleType: string,
  multiplier = 0
): number => {
  const vehicle = DAMAGE_MAT_VEHICLES.find((item) => item.value === vehicleType)
  if (!vehicle) return 0

  const base = Number(config?.[vehicle.configKey] ?? vehicle.defaultRate) || 0

  if (!vehicle.perUnitKey) {
    return base
  }

  const perUnit = Number(config?.[vehicle.perUnitKey] ?? vehicle.perUnitDefault) || 0
  const numericMultiplier = Number(multiplier) || 0
  const billableUnits = Math.max(0, numericMultiplier - 3.5)

  return base + perUnit * billableUnits
}
