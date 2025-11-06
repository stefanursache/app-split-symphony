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
  z_bottom: number;
  z_top: number;
  // Stresses at bottom of ply
  sigma_1_bottom: number;
  sigma_2_bottom: number;
  tau_12_bottom: number;
  // Stresses at top of ply
  sigma_1_top: number;
  sigma_2_top: number;
  tau_12_top: number;
  // Strains at bottom
  epsilon_1_bottom: number;
  epsilon_2_bottom: number;
  gamma_12_bottom: number;
  // Strains at top
  epsilon_1_top: number;
  epsilon_2_top: number;
  gamma_12_top: number;
  // Global stresses (at mid-plane)
  sigma_x: number;
  sigma_y: number;
  tau_xy: number;
  // Principal stresses (maximum of top/bottom)
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
  geometryType: 'plate' | 'tube';
  plateWidth?: number;
}
