import { Material, Ply, Loads, StressResult } from '@/types/materials';
import { calculateABDMatrix } from './abdMatrix';
import { calculatePlyPositions, calculateStrainsAtZ, transformStrainsToMaterial, calculateStressesFromStrains } from './cltCalculations';

/**
 * Cylindrical Shell Theory for composite tubes
 * Accounts for curvature effects in thin-wall tubes
 */

export interface CylindricalShellGeometry {
  innerRadius: number; // mm
  outerRadius: number; // mm
  length: number; // mm
}

export function calculateCylindricalShellStresses(
  plies: Ply[],
  materials: Record<string, Material>,
  loads: Loads,
  geometry: CylindricalShellGeometry
): StressResult[] {
  if (plies.length === 0) return [];

  const R_mid = (geometry.innerRadius + geometry.outerRadius) / 2; // Mid-surface radius
  const totalThickness = plies.reduce((sum, ply) => {
    const material = materials[ply.material];
    return sum + (material?.thickness || 0);
  }, 0);

  // Check if thin-wall assumption is valid (R/t > 10)
  const thinWallRatio = R_mid / totalThickness;
  const isThinWall = thinWallRatio > 10;

  // Calculate ABD matrix
  const abdMatrix = calculateABDMatrix(plies, materials);
  
  // For cylindrical shells, modify the strain-displacement relations
  // to account for curvature effects
  
  // Calculate mid-surface strains with curvature correction
  // epsilon_theta = u/R (hoop strain includes curvature effect)
  // epsilon_x = du/dx (axial strain, similar to flat plate)
  
  const { A, B, D } = abdMatrix;
  
  // Invert ABD matrix to get compliance matrix
  const ABD_full = [
    [A[0][0], A[0][1], A[0][2], B[0][0], B[0][1], B[0][2]],
    [A[1][0], A[1][1], A[1][2], B[1][0], B[1][1], B[1][2]],
    [A[2][0], A[2][1], A[2][2], B[2][0], B[2][1], B[2][2]],
    [B[0][0], B[0][1], B[0][2], D[0][0], D[0][1], D[0][2]],
    [B[1][0], B[1][1], B[1][2], D[1][0], D[1][1], D[1][2]],
    [B[2][0], B[2][1], B[2][2], D[2][0], D[2][1], D[2][2]]
  ];

  const abd_inv = invertMatrix6x6(ABD_full);
  
  // Force and moment resultants
  const N = [loads.Nx, loads.Ny, loads.Nxy];
  const M = [loads.Mx, loads.My, loads.Mxy];
  const forceMoment = [...N, ...M];
  
  // Calculate mid-surface strains and curvatures
  let strains: number[] = [0, 0, 0];
  let curvatures: number[] = [0, 0, 0];
  
  for (let i = 0; i < 6; i++) {
    let sum = 0;
    for (let j = 0; j < 6; j++) {
      sum += abd_inv[i][j] * forceMoment[j];
    }
    if (i < 3) {
      strains[i] = sum;
    } else {
      curvatures[i - 3] = sum;
    }
  }

  // Apply curvature correction for cylindrical geometry
  if (isThinWall) {
    // For thin-wall cylinders, add curvature correction to hoop strain
    // Donnell-Mushtari-Vlasov theory correction
    const curvatureCorrection = 1 / R_mid;
    curvatures[1] += curvatureCorrection * strains[1]; // Hoop direction correction
  }

  // Get ply positions through thickness
  const plyPositions = calculatePlyPositions(plies, materials);
  
  // Calculate stresses for each ply
  const results: StressResult[] = [];
  
  plies.forEach((ply, index) => {
    const material = materials[ply.material];
    if (!material) return;
    
    const z_bottom = plyPositions[index].z_bottom;
    const z_top = plyPositions[index].z_top;
    const z_mid = (z_bottom + z_top) / 2;
    
    // Calculate radius at ply mid-surface
    const R_ply = R_mid + z_mid;
    
    // Strains at bottom of ply
    const strainsBottom = calculateStrainsAtZ(z_bottom, strains, curvatures);
    
    // Apply cylindrical shell correction to strains
    if (isThinWall) {
      // Add curvature-induced strain component
      const curvatureEffect = z_bottom / R_ply;
      strainsBottom.epsilon_y *= (1 + curvatureEffect); // Hoop strain correction
    }
    
    const materialStrainsBottom = transformStrainsToMaterial(
      strainsBottom.epsilon_x,
      strainsBottom.epsilon_y,
      strainsBottom.gamma_xy,
      ply.angle
    );
    
    const stressesBottom = calculateStressesFromStrains(
      materialStrainsBottom.epsilon_1,
      materialStrainsBottom.epsilon_2,
      materialStrainsBottom.gamma_12,
      material
    );
    
    // Strains at top of ply
    const strainsTop = calculateStrainsAtZ(z_top, strains, curvatures);
    
    if (isThinWall) {
      const curvatureEffect = z_top / R_ply;
      strainsTop.epsilon_y *= (1 + curvatureEffect);
    }
    
    const materialStrainsTop = transformStrainsToMaterial(
      strainsTop.epsilon_x,
      strainsTop.epsilon_y,
      strainsTop.gamma_xy,
      ply.angle
    );
    
    const stressesTop = calculateStressesFromStrains(
      materialStrainsTop.epsilon_1,
      materialStrainsTop.epsilon_2,
      materialStrainsTop.gamma_12,
      material
    );
    
    // Calculate mid-plane stresses in global coordinates (for display)
    const strainsMid = calculateStrainsAtZ(z_mid, strains, curvatures);
    
    if (isThinWall) {
      const curvatureEffect = z_mid / R_ply;
      strainsMid.epsilon_y *= (1 + curvatureEffect);
    }
    
    const c = Math.cos(ply.angle * Math.PI / 180);
    const s = Math.sin(ply.angle * Math.PI / 180);
    const c2 = c * c;
    const s2 = s * s;
    
    const E1 = material.E1;
    const E2 = material.E2;
    const nu12 = material.nu12;
    const G12 = material.G12;
    const nu21 = nu12 * E2 / E1;
    const denom = 1 - nu12 * nu21;
    
    const Q11 = E1 / denom;
    const Q12 = nu12 * E2 / denom;
    const Q22 = E2 / denom;
    const Q66 = G12;
    
    const sigma_x = Q11 * c2 * strainsMid.epsilon_x + Q12 * s2 * strainsMid.epsilon_y + Q66 * s * c * strainsMid.gamma_xy;
    const sigma_y = Q12 * c2 * strainsMid.epsilon_x + Q22 * s2 * strainsMid.epsilon_y - Q66 * s * c * strainsMid.gamma_xy;
    const tau_xy = (Q11 - Q12) * s * c * strainsMid.epsilon_x + (Q12 - Q22) * s * c * strainsMid.epsilon_y + Q66 * (c2 - s2) * strainsMid.gamma_xy;
    
    // Calculate principal stresses (using maximum from top/bottom)
    const maxSigma1 = Math.max(Math.abs(stressesBottom.sigma_1), Math.abs(stressesTop.sigma_1));
    const maxSigma2 = Math.max(Math.abs(stressesBottom.sigma_2), Math.abs(stressesTop.sigma_2));
    
    const sigma_principal_max = Math.max(maxSigma1, maxSigma2);
    const sigma_principal_min = Math.min(maxSigma1, maxSigma2);
    const tau_max = (sigma_principal_max - sigma_principal_min) / 2;
    
    // von Mises stress
    const von_mises = Math.sqrt(
      sigma_principal_max ** 2 - sigma_principal_max * sigma_principal_min + sigma_principal_min ** 2
    );
    
    results.push({
      ply: index + 1,
      material: material.name,
      angle: ply.angle,
      z_bottom,
      z_top,
      sigma_1_bottom: stressesBottom.sigma_1,
      sigma_2_bottom: stressesBottom.sigma_2,
      tau_12_bottom: stressesBottom.tau_12,
      sigma_1_top: stressesTop.sigma_1,
      sigma_2_top: stressesTop.sigma_2,
      tau_12_top: stressesTop.tau_12,
      epsilon_1_bottom: materialStrainsBottom.epsilon_1,
      epsilon_2_bottom: materialStrainsBottom.epsilon_2,
      gamma_12_bottom: materialStrainsBottom.gamma_12,
      epsilon_1_top: materialStrainsTop.epsilon_1,
      epsilon_2_top: materialStrainsTop.epsilon_2,
      gamma_12_top: materialStrainsTop.gamma_12,
      sigma_x,
      sigma_y,
      tau_xy,
      sigma_principal_max,
      sigma_principal_min,
      tau_max,
      von_mises
    });
  });
  
  return results;
}

function invertMatrix6x6(A: number[][]): number[][] {
  const n = 6;
  const augmented: number[][] = [];
  
  for (let i = 0; i < n; i++) {
    augmented[i] = [...A[i]];
    for (let j = 0; j < n; j++) {
      augmented[i][n + j] = i === j ? 1 : 0;
    }
  }
  
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    const pivot = augmented[i][i];
    if (Math.abs(pivot) < 1e-10) continue;
    
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }
    
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }
  
  const inverse: number[][] = [];
  for (let i = 0; i < n; i++) {
    inverse[i] = augmented[i].slice(n);
  }
  
  return inverse;
}
