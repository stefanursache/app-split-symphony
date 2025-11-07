import { Material, Ply, Loads } from '@/types/materials';
import { calculateABDMatrix } from './abdMatrix';
import { calculateStrainsAndCurvatures, calculatePlyPositions } from './cltCalculations';

export interface InterlaminarStressResult {
  z: number; // Through-thickness position
  sigma_z: number; // Out-of-plane normal stress
  tau_xz: number; // Out-of-plane shear stress (xz)
  tau_yz: number; // Out-of-plane shear stress (yz)
  interface_number: number; // Interface between plies
  delamination_risk: 'Low' | 'Medium' | 'High';
}

export function calculateInterlaminarStresses(
  plies: Ply[],
  materials: Record<string, Material>,
  loads: Loads
): InterlaminarStressResult[] {
  const results: InterlaminarStressResult[] = [];

  if (plies.length === 0) return results;

  const ABDMatrix = calculateABDMatrix(plies, materials);
  const { strains, curvatures } = calculateStrainsAndCurvatures(ABDMatrix, loads);
  const plyPositions = calculatePlyPositions(plies, materials);

  // Calculate interlaminar stresses at each interface
  for (let i = 0; i < plies.length - 1; i++) {
    const material1 = materials[plies[i].material];
    const material2 = materials[plies[i + 1].material];
    
    if (!material1 || !material2) continue;

    const z = plyPositions[i].z_top; // Interface position
    const angle1 = plies[i].angle * Math.PI / 180;
    const angle2 = plies[i + 1].angle * Math.PI / 180;

    // Check for ply angle mismatch (higher risk of delamination)
    const angleMismatch = Math.abs(plies[i].angle - plies[i + 1].angle);
    
    // Calculate strains at interface
    const epsilon_x = strains[0] + z * curvatures[0];
    const epsilon_y = strains[1] + z * curvatures[1];
    const gamma_xy = strains[2] + z * curvatures[2];

    // Estimate out-of-plane stresses using equilibrium equations
    // These are simplified estimates - full 3D FEA would be more accurate
    
    // tau_xz and tau_yz from shear force distribution
    const tau_xz = loads.Nxy !== 0 ? 
      (3 * loads.Nxy / (2 * plyPositions[plyPositions.length - 1].z_top)) * 
      (1 - (z / plyPositions[plyPositions.length - 1].z_top) ** 2) : 0;
    
    const tau_yz = loads.Nxy !== 0 ?
      (3 * loads.Nxy / (2 * plyPositions[plyPositions.length - 1].z_top)) * 
      (1 - (z / plyPositions[plyPositions.length - 1].z_top) ** 2) : 0;

    // sigma_z is typically small except at free edges
    // Estimate based on material mismatch and curvature
    const materialMismatchFactor = Math.abs(material1.E1 - material2.E1) / 
      Math.max(material1.E1, material2.E1);
    
    const sigma_z = materialMismatchFactor * 
      Math.abs(curvatures[0] + curvatures[1]) * 
      Math.max(material1.E1, material2.E1) * 0.01;

    // Assess delamination risk
    let delamination_risk: 'Low' | 'Medium' | 'High' = 'Low';
    
    const tau_max = Math.sqrt(tau_xz ** 2 + tau_yz ** 2);
    const avg_shear_strength = ((material1.shear_strength || 50) + 
      (material2.shear_strength || 50)) / 2;
    
    if (tau_max > 0.5 * avg_shear_strength || angleMismatch > 45 || sigma_z > 10) {
      delamination_risk = 'High';
    } else if (tau_max > 0.3 * avg_shear_strength || angleMismatch > 30 || sigma_z > 5) {
      delamination_risk = 'Medium';
    }

    results.push({
      z,
      sigma_z,
      tau_xz,
      tau_yz,
      interface_number: i + 1,
      delamination_risk
    });
  }

  return results;
}

export function assessDelaminationRisk(results: InterlaminarStressResult[]): {
  overallRisk: 'Low' | 'Medium' | 'High';
  criticalInterfaces: number[];
  maxShearStress: number;
} {
  if (results.length === 0) {
    return {
      overallRisk: 'Low',
      criticalInterfaces: [],
      maxShearStress: 0
    };
  }

  const highRiskCount = results.filter(r => r.delamination_risk === 'High').length;
  const mediumRiskCount = results.filter(r => r.delamination_risk === 'Medium').length;

  let overallRisk: 'Low' | 'Medium' | 'High' = 'Low';
  if (highRiskCount > 0) {
    overallRisk = 'High';
  } else if (mediumRiskCount > results.length / 2) {
    overallRisk = 'High';
  } else if (mediumRiskCount > 0) {
    overallRisk = 'Medium';
  }

  const criticalInterfaces = results
    .filter(r => r.delamination_risk === 'High')
    .map(r => r.interface_number);

  const maxShearStress = Math.max(...results.map(r => 
    Math.sqrt(r.tau_xz ** 2 + r.tau_yz ** 2)
  ));

  return {
    overallRisk,
    criticalInterfaces,
    maxShearStress
  };
}
