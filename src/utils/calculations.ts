import { Ply, Material, EngineeringProperties, StressResult, Loads } from '@/types/materials';
import { calculateABDMatrix } from './abdMatrix';
import { 
  calculateStrainsAndCurvatures, 
  calculatePlyPositions,
  calculateStrainsAtZ,
  transformStrainsToMaterial,
  calculateStressesFromStrains
} from './cltCalculations';
import { GeometryConfig } from '@/types/geometry';

export function calculateEngineeringProperties(
  plies: Ply[],
  materials: Record<string, Material>
): EngineeringProperties {
  if (plies.length === 0) {
    return { Ex: 0, Ey: 0, Gxy: 0, nuxy: 0, thickness: 0 };
  }

  let A11 = 0, A12 = 0, A22 = 0, A66 = 0;
  let h = 0;

  plies.forEach(ply => {
    const material = materials[ply.material];
    if (!material) return;

    const t = material.thickness;
    const angleRad = ply.angle * Math.PI / 180;
    
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    
    const E1 = material.E1;
    const E2 = material.E2;
    const nu12 = material.nu12;
    const G12 = material.G12;
    
    const c2 = c * c;
    const s2 = s * s;
    const c4 = c2 * c2;
    const s4 = s2 * s2;
    
    const Q11 = E1 / (1 - nu12 * (E2 / E1) * nu12);
    const Q12 = (nu12 * E2) / (1 - nu12 * (E2 / E1) * nu12);
    const Q22 = E2 / (1 - nu12 * (E2 / E1) * nu12);
    const Q66 = G12;
    
    const Q11_bar = Q11 * c4 + 2 * (Q12 + 2 * Q66) * s2 * c2 + Q22 * s4;
    const Q12_bar = (Q11 + Q22 - 4 * Q66) * s2 * c2 + Q12 * (s4 + c4);
    const Q22_bar = Q11 * s4 + 2 * (Q12 + 2 * Q66) * s2 * c2 + Q22 * c4;
    const Q66_bar = (Q11 + Q22 - 2 * Q12 - 2 * Q66) * s2 * c2 + Q66 * (s4 + c4);
    
    A11 += Q11_bar * t;
    A12 += Q12_bar * t;
    A22 += Q22_bar * t;
    A66 += Q66_bar * t;
    h += t;
  });

  const Ex = (A11 * A22 - A12 * A12) / (A22 * h);
  const Ey = (A11 * A22 - A12 * A12) / (A11 * h);
  const Gxy = A66 / h;
  const nuxy = A12 / A22;

  return { Ex, Ey, Gxy, nuxy, thickness: h };
}

export function calculateStressStrain(
  plies: Ply[],
  materials: Record<string, Material>,
  loads: Loads,
  geometry: GeometryConfig
): StressResult[] {
  if (plies.length === 0) return [];

  // Calculate ABD matrix
  const abdMatrix = calculateABDMatrix(plies, materials);

  // Calculate mid-plane strains and curvatures directly from loads
  const { strains, curvatures } = calculateStrainsAndCurvatures(abdMatrix, loads);

  // Get ply positions through thickness
  const plyPositions = calculatePlyPositions(plies, materials);

  // Calculate stresses for each ply
  const results: StressResult[] = [];

  plies.forEach((ply, index) => {
    const material = materials[ply.material];
    if (!material) return;

    const { z_bottom, z_top } = plyPositions[index];
    const z_mid = (z_bottom + z_top) / 2;

    // Calculate strains at bottom and top of ply
    const strainsBottom = calculateStrainsAtZ(z_bottom, strains, curvatures);
    const strainsTop = calculateStrainsAtZ(z_top, strains, curvatures);
    const strainsMid = calculateStrainsAtZ(z_mid, strains, curvatures);

    // Transform to material coordinates
    const materialStrainsBottom = transformStrainsToMaterial(
      strainsBottom.epsilon_x,
      strainsBottom.epsilon_y,
      strainsBottom.gamma_xy,
      ply.angle
    );
    const materialStrainsTop = transformStrainsToMaterial(
      strainsTop.epsilon_x,
      strainsTop.epsilon_y,
      strainsTop.gamma_xy,
      ply.angle
    );

    // Calculate stresses
    const stressesBottom = calculateStressesFromStrains(
      materialStrainsBottom.epsilon_1,
      materialStrainsBottom.epsilon_2,
      materialStrainsBottom.gamma_12,
      material
    );
    const stressesTop = calculateStressesFromStrains(
      materialStrainsTop.epsilon_1,
      materialStrainsTop.epsilon_2,
      materialStrainsTop.gamma_12,
      material
    );

    // Calculate principal stresses (use maximum magnitudes)
    const allStresses = [
      stressesBottom.sigma_1,
      stressesBottom.sigma_2,
      stressesTop.sigma_1,
      stressesTop.sigma_2
    ];
    const sigma_principal_max = Math.max(...allStresses);
    const sigma_principal_min = Math.min(...allStresses);
    const tau_max = Math.max(
      Math.abs(stressesBottom.tau_12),
      Math.abs(stressesTop.tau_12)
    );

    // von Mises (use maximum from top or bottom)
    const von_mises_bottom = Math.sqrt(
      stressesBottom.sigma_1 * stressesBottom.sigma_1 +
      stressesBottom.sigma_2 * stressesBottom.sigma_2 -
      stressesBottom.sigma_1 * stressesBottom.sigma_2 +
      3 * stressesBottom.tau_12 * stressesBottom.tau_12
    );
    const von_mises_top = Math.sqrt(
      stressesTop.sigma_1 * stressesTop.sigma_1 +
      stressesTop.sigma_2 * stressesTop.sigma_2 -
      stressesTop.sigma_1 * stressesTop.sigma_2 +
      3 * stressesTop.tau_12 * stressesTop.tau_12
    );
    const von_mises = Math.max(von_mises_bottom, von_mises_top);

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
      sigma_x: strainsMid.epsilon_x,
      sigma_y: strainsMid.epsilon_y,
      tau_xy: strainsMid.gamma_xy,
      sigma_principal_max,
      sigma_principal_min,
      tau_max,
      von_mises
    });
  });

  return results;
}
