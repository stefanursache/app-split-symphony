import { Ply, Material, Loads } from '@/types/materials';

export interface FailureResult {
  ply: number;
  material: string;
  angle: number;
  failureIndex: number;
  safetyMargin: number;
  failureMode: string;
  isPassed: boolean;
}

export interface SafetySummary {
  minimumSafetyFactor: number;
  criticalPly: number;
  maxFailureIndex: number;
  designMeetsSafety: boolean;
}

export function calculateFailureAnalysis(
  plies: Ply[],
  materials: Record<string, Material>,
  stresses: Array<{ sigma_1: number; sigma_2: number; tau_12: number }>,
  safetyFactor: number,
  failureCriterion: 'max_stress' | 'tsai_wu' | 'tsai_hill'
): FailureResult[] {
  return plies.map((ply, index) => {
    const material = materials[ply.material];
    if (!material || !stresses[index]) {
      return {
        ply: index + 1,
        material: ply.material,
        angle: ply.angle,
        failureIndex: 0,
        safetyMargin: 0,
        failureMode: 'No data',
        isPassed: false
      };
    }

    const { sigma_1, sigma_2, tau_12 } = stresses[index];
    let failureIndex = 0;
    let failureMode = 'No failure';

    switch (failureCriterion) {
      case 'max_stress':
        failureIndex = calculateMaxStressFailure(sigma_1, sigma_2, tau_12, material);
        failureMode = determineMaxStressFailureMode(sigma_1, sigma_2, tau_12, material);
        break;
      case 'tsai_wu':
        failureIndex = calculateTsaiWuFailure(sigma_1, sigma_2, tau_12, material);
        failureMode = 'Tsai-Wu criterion';
        break;
      case 'tsai_hill':
        failureIndex = calculateTsaiHillFailure(sigma_1, sigma_2, tau_12, material);
        failureMode = 'Tsai-Hill criterion';
        break;
    }

    const safetyMargin = ((1 / failureIndex) - 1) * 100;
    const isPassed = failureIndex * safetyFactor < 1;

    return {
      ply: index + 1,
      material: ply.material,
      angle: ply.angle,
      failureIndex,
      safetyMargin,
      failureMode,
      isPassed
    };
  });
}

function calculateMaxStressFailure(
  sigma_1: number,
  sigma_2: number,
  tau_12: number,
  material: Material
): number {
  const tensileStrength = material.tensile_strength || 1000;
  const compressiveStrength = material.compressive_strength || 1000;
  const shearStrength = material.shear_strength || 100;

  const fi1 = sigma_1 >= 0 
    ? Math.abs(sigma_1) / tensileStrength 
    : Math.abs(sigma_1) / compressiveStrength;
  
  const fi2 = sigma_2 >= 0 
    ? Math.abs(sigma_2) / tensileStrength 
    : Math.abs(sigma_2) / compressiveStrength;
  
  const fi12 = Math.abs(tau_12) / shearStrength;

  return Math.max(fi1, fi2, fi12);
}

function determineMaxStressFailureMode(
  sigma_1: number,
  sigma_2: number,
  tau_12: number,
  material: Material
): string {
  const tensileStrength = material.tensile_strength || 1000;
  const compressiveStrength = material.compressive_strength || 1000;
  const shearStrength = material.shear_strength || 100;

  const fi1 = sigma_1 >= 0 
    ? Math.abs(sigma_1) / tensileStrength 
    : Math.abs(sigma_1) / compressiveStrength;
  
  const fi2 = sigma_2 >= 0 
    ? Math.abs(sigma_2) / tensileStrength 
    : Math.abs(sigma_2) / compressiveStrength;
  
  const fi12 = Math.abs(tau_12) / shearStrength;

  const maxFI = Math.max(fi1, fi2, fi12);

  if (maxFI < 1) return 'No failure';
  
  if (fi1 === maxFI) {
    return sigma_1 >= 0 ? 'Longitudinal tension' : 'Longitudinal compression';
  } else if (fi2 === maxFI) {
    return sigma_2 >= 0 ? 'Transverse tension' : 'Transverse compression';
  } else {
    return 'Shear failure';
  }
}

function calculateTsaiWuFailure(
  sigma_1: number,
  sigma_2: number,
  tau_12: number,
  material: Material
): number {
  const Xt = material.tensile_strength || 1000;
  const Xc = material.compressive_strength || 1000;
  const Yt = material.tensile_strength || 1000;
  const Yc = material.compressive_strength || 1000;
  const S = material.shear_strength || 100;

  const F1 = 1/Xt - 1/Xc;
  const F2 = 1/Yt - 1/Yc;
  const F11 = 1/(Xt * Xc);
  const F22 = 1/(Yt * Yc);
  const F66 = 1/(S * S);
  const F12 = -0.5 * Math.sqrt(F11 * F22);

  const fi = F1 * sigma_1 + F2 * sigma_2 + 
             F11 * sigma_1 * sigma_1 + F22 * sigma_2 * sigma_2 + 
             F66 * tau_12 * tau_12 + 
             2 * F12 * sigma_1 * sigma_2;

  return Math.sqrt(Math.max(0, fi));
}

function calculateTsaiHillFailure(
  sigma_1: number,
  sigma_2: number,
  tau_12: number,
  material: Material
): number {
  const X = sigma_1 >= 0 
    ? (material.tensile_strength || 1000) 
    : (material.compressive_strength || 1000);
  const Y = sigma_2 >= 0 
    ? (material.tensile_strength || 1000) 
    : (material.compressive_strength || 1000);
  const S = material.shear_strength || 100;

  const fi = (sigma_1 * sigma_1) / (X * X) - 
             (sigma_1 * sigma_2) / (X * X) + 
             (sigma_2 * sigma_2) / (Y * Y) + 
             (tau_12 * tau_12) / (S * S);

  return Math.sqrt(Math.max(0, fi));
}

export function calculateSafetySummary(
  failureResults: FailureResult[],
  safetyFactor: number
): SafetySummary {
  if (failureResults.length === 0) {
    return {
      minimumSafetyFactor: 0,
      criticalPly: 0,
      maxFailureIndex: 0,
      designMeetsSafety: false
    };
  }

  const maxFailureIndex = Math.max(...failureResults.map(r => r.failureIndex));
  const criticalPly = failureResults.find(r => r.failureIndex === maxFailureIndex)?.ply || 0;
  const minimumSafetyFactor = 1 / maxFailureIndex;
  const designMeetsSafety = maxFailureIndex * safetyFactor < 1;

  return {
    minimumSafetyFactor,
    criticalPly,
    maxFailureIndex,
    designMeetsSafety
  };
}
