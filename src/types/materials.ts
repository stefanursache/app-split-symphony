export interface Material {
  name: string;
  type: string;
  E1: number; // MPa - Longitudinal modulus
  E2: number; // MPa - Transverse modulus
  G12: number; // MPa - Shear modulus
  nu12: number; // Poisson's ratio
  tensile_strength: number | null;
  compressive_strength: number | null;
  shear_strength: number | null;
  thermal_resistance: number;
  density: number;
  thickness: number; // mm per ply
  color: string;
}

export interface Ply {
  material: string;
  angle: number;
}

export interface Loads {
  axial: number;
  bending: number;
  torsion: number;
}

export interface EngineeringProperties {
  Ex: number;
  Ey: number;
  Gxy: number;
  nuxy: number;
  thickness: number;
}

export interface StressResult {
  ply: number;
  material: string;
  angle: number;
  sigma_1: number;
  sigma_2: number;
  tau_12: number;
  epsilon_1: number;
  epsilon_2: number;
  gamma_12: number;
  sigma_x: number;
  sigma_y: number;
  tau_xy: number;
  sigma_principal_max: number;
  sigma_principal_min: number;
  tau_max: number;
  von_mises: number;
}

export interface AppState {
  plies: Ply[];
  selectedMaterial: string;
  loads: Loads;
  activeTab: string;
  activeLoadCase: string;
  comparisonConfigs: any[];
  safetyFactor: number;
  failureCriterion: string;
  editingMaterial: string | null;
  outerDiameter: number;
  innerDiameter: number;
  operatingTemp: string;
}
