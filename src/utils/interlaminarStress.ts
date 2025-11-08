import { Material, Ply, Loads } from '@/types/materials';
import { calculateABDMatrix } from './abdMatrix';
import { calculateStrainsAndCurvatures, calculatePlyPositions } from './cltCalculations';

// Helper function to calculate Q matrix (stiffness matrix in material coordinates)
function calculateQMatrix(material: Material): number[][] {
  const E1 = material.E1;
  const E2 = material.E2;
  const G12 = material.G12;
  const nu12 = material.nu12;
  const nu21 = nu12 * E2 / E1;
  
  const Q11 = E1 / (1 - nu12 * nu21);
  const Q12 = nu12 * E2 / (1 - nu12 * nu21);
  const Q22 = E2 / (1 - nu12 * nu21);
  const Q66 = G12;
  
  return [
    [Q11, Q12, 0],
    [Q12, Q22, 0],
    [0, 0, Q66]
  ];
}

// Helper function to transform Q matrix to global coordinates
function transformQMatrix(Q: number[][], angle: number): number[][] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const c2 = c * c;
  const s2 = s * s;
  const cs = c * s;
  
  const Q11 = Q[0][0] * c2*c2 + 2 * (Q[0][1] + 2*Q[2][2]) * c2*s2 + Q[1][1] * s2*s2;
  const Q12 = (Q[0][0] + Q[1][1] - 4*Q[2][2]) * c2*s2 + Q[0][1] * (c2*c2 + s2*s2);
  const Q16 = (Q[0][0] - Q[0][1] - 2*Q[2][2]) * cs*c2 + (Q[0][1] - Q[1][1] + 2*Q[2][2]) * cs*s2;
  const Q22 = Q[0][0] * s2*s2 + 2 * (Q[0][1] + 2*Q[2][2]) * c2*s2 + Q[1][1] * c2*c2;
  const Q26 = (Q[0][0] - Q[0][1] - 2*Q[2][2]) * cs*s2 + (Q[0][1] - Q[1][1] + 2*Q[2][2]) * cs*c2;
  const Q66 = (Q[0][0] + Q[1][1] - 2*Q[0][1] - 2*Q[2][2]) * c2*s2 + Q[2][2] * (c2*c2 + s2*s2);
  
  return [
    [Q11, Q12, Q16],
    [Q12, Q22, Q26],
    [Q16, Q26, Q66]
  ];
}

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

    // Calculate out-of-plane interlaminar stresses using equilibrium equations
    // Based on Classical Lamination Theory and through-thickness integration
    
    const h = plyPositions[plyPositions.length - 1].z_top - plyPositions[0].z_bottom; // Total thickness
    const h_half = h / 2;
    
    // Calculate Q matrices for both materials at interface
    const Q1 = calculateQMatrix(material1);
    const Q2 = calculateQMatrix(material2);
    
    // Transform Q matrices to global coordinates
    const Q1_bar = transformQMatrix(Q1, angle1);
    const Q2_bar = transformQMatrix(Q2, angle2);
    
    // Out-of-plane shear stresses from equilibrium: dτxz/dz = -dσx/dx
    // Using parabolic distribution through thickness
    // τxz = (1/(2h)) * ∫(Q̄16*ε⁰x + Q̄26*ε⁰y + Q̄66*γ⁰xy) dz
    
    const tau_xz = (1 / (2 * h)) * (
      (Q1_bar[0][2] + Q2_bar[0][2]) * strains[0] +
      (Q1_bar[1][2] + Q2_bar[1][2]) * strains[1] +
      (Q1_bar[2][2] + Q2_bar[2][2]) * strains[2]
    ) * (1 - (z / h_half) ** 2);
    
    const tau_yz = (1 / (2 * h)) * (
      (Q1_bar[1][2] + Q2_bar[1][2]) * strains[1] +
      (Q1_bar[0][2] + Q2_bar[0][2]) * strains[0] +
      (Q1_bar[2][2] + Q2_bar[2][2]) * strains[2]
    ) * (1 - (z / h_half) ** 2);

    // Out-of-plane normal stress from material property mismatch
    // σz arises from Poisson effect mismatch between adjacent plies
    const nu_mismatch = Math.abs(
      (material1.nu12 * material1.E2 / material1.E1) - 
      (material2.nu12 * material2.E2 / material2.E1)
    );
    
    const sigma_z = nu_mismatch * (
      Math.abs(epsilon_x * material1.E1) + Math.abs(epsilon_y * material1.E2)
    ) * 0.1; // Scaling factor for through-thickness effect

    // Assess delamination risk based on multiple criteria
    let delamination_risk: 'Low' | 'Medium' | 'High' = 'Low';
    
    const tau_max = Math.sqrt(tau_xz ** 2 + tau_yz ** 2);
    const avg_shear_strength = ((material1.shear_strength || 50) + 
      (material2.shear_strength || 50)) / 2;
    
    // Calculate shear stress ratio
    const shear_ratio = tau_max / avg_shear_strength;
    
    // Assess normal stress (typical limit: 5-15 MPa for composites)
    const sigma_z_abs = Math.abs(sigma_z);
    
    // Risk criteria:
    // High: Shear ratio > 0.6 OR angle mismatch > 60° OR σz > 15 MPa
    // Medium: Shear ratio > 0.4 OR angle mismatch > 45° OR σz > 8 MPa
    if (shear_ratio > 0.6 || angleMismatch > 60 || sigma_z_abs > 15) {
      delamination_risk = 'High';
    } else if (shear_ratio > 0.4 || angleMismatch > 45 || sigma_z_abs > 8) {
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
