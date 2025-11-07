import { Material, Ply } from '@/types/materials';

export interface ThermalStrains {
  epsilon_x_thermal: number;
  epsilon_y_thermal: number;
  gamma_xy_thermal: number;
}

export function calculateThermalStrains(
  plies: Ply[],
  materials: Record<string, Material>,
  deltaT: number
): ThermalStrains {
  if (plies.length === 0 || deltaT === 0) {
    return { epsilon_x_thermal: 0, epsilon_y_thermal: 0, gamma_xy_thermal: 0 };
  }

  let totalThickness = 0;
  let weighted_alpha_x = 0;
  let weighted_alpha_y = 0;

  plies.forEach((ply) => {
    const material = materials[ply.material];
    if (!material) return;

    const t = material.thickness;
    const alpha1 = material.alpha1 || 0;
    const alpha2 = material.alpha2 || 0;
    const angleRad = ply.angle * Math.PI / 180;
    
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    const c2 = c * c;
    const s2 = s * s;
    
    // Transform thermal expansion coefficients to global coordinates
    const alpha_x = alpha1 * c2 + alpha2 * s2;
    const alpha_y = alpha1 * s2 + alpha2 * c2;
    
    weighted_alpha_x += alpha_x * t;
    weighted_alpha_y += alpha_y * t;
    totalThickness += t;
  });

  const avg_alpha_x = weighted_alpha_x / totalThickness;
  const avg_alpha_y = weighted_alpha_y / totalThickness;

  return {
    epsilon_x_thermal: avg_alpha_x * deltaT,
    epsilon_y_thermal: avg_alpha_y * deltaT,
    gamma_xy_thermal: 0 // No thermal shear strain for orthotropic materials
  };
}

export interface ThermalStressResult {
  ply: number;
  material: string;
  angle: number;
  sigma_1_thermal: number;
  sigma_2_thermal: number;
  tau_12_thermal: number;
}

export function calculateThermalStresses(
  plies: Ply[],
  materials: Record<string, Material>,
  deltaT: number
): ThermalStressResult[] {
  const results: ThermalStressResult[] = [];

  plies.forEach((ply, index) => {
    const material = materials[ply.material];
    if (!material) return;

    const alpha1 = material.alpha1 || 0;
    const alpha2 = material.alpha2 || 0;
    const angleRad = ply.angle * Math.PI / 180;
    
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    const c2 = c * c;
    const s2 = s * s;
    
    // Thermal strains in material coordinates
    const epsilon_1_thermal = alpha1 * deltaT;
    const epsilon_2_thermal = alpha2 * deltaT;
    
    // Calculate thermal stresses using material properties
    const E1 = material.E1;
    const E2 = material.E2;
    const nu12 = material.nu12;
    const nu21 = nu12 * E2 / E1;
    const denom = 1 - nu12 * nu21;
    
    const Q11 = E1 / denom;
    const Q12 = nu12 * E2 / denom;
    const Q22 = E2 / denom;
    
    // Thermal stresses (negative because thermal expansion is resisted)
    const sigma_1_thermal = -(Q11 * epsilon_1_thermal + Q12 * epsilon_2_thermal);
    const sigma_2_thermal = -(Q12 * epsilon_1_thermal + Q22 * epsilon_2_thermal);
    
    results.push({
      ply: index + 1,
      material: material.name,
      angle: ply.angle,
      sigma_1_thermal,
      sigma_2_thermal,
      tau_12_thermal: 0
    });
  });

  return results;
}
