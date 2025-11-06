import { Material, Ply, EngineeringProperties, StressResult } from '@/types/materials';

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

  const det = A11 * A22 - A12 * A12;
  
  const Ex = (A11 * A22 - A12 * A12) / (A22 * h);
  const Ey = (A11 * A22 - A12 * A12) / (A11 * h);
  const Gxy = A66 / h;
  const nuxy = A12 / A22;

  return { Ex, Ey, Gxy, nuxy, thickness: h };
}

export function calculateStressStrain(
  plies: Ply[],
  materials: Record<string, Material>,
  loads: { axial: number; bending: number; torsion: number },
  outerDiameter: number
): StressResult[] {
  if (plies.length === 0) return [];

  const h = plies.reduce((sum, ply) => sum + materials[ply.material]?.thickness || 0, 0);
  const innerDiameter = outerDiameter - 2 * h;
  const area = Math.PI * (outerDiameter * outerDiameter - innerDiameter * innerDiameter) / 4;

  const Nx = loads.axial;
  const Mx = loads.bending;
  const Mt = loads.torsion;

  const I = Math.PI * (Math.pow(outerDiameter, 4) - Math.pow(innerDiameter, 4)) / 64;
  const c = outerDiameter / 2;
  const r_mean = (outerDiameter + innerDiameter) / 4;
  const J = Math.PI * (Math.pow(outerDiameter, 4) - Math.pow(innerDiameter, 4)) / 32;

  const sigma_axial = Nx / area;
  const sigma_bending = Mx * c / I;
  const tau_torsion = Mt * r_mean / J;

  const results: StressResult[] = [];

  plies.forEach((ply, index) => {
    const material = materials[ply.material];
    if (!material) return;

    const angleRad = ply.angle * Math.PI / 180;

    // Global stresses
    const sigma_x = sigma_axial + sigma_bending;
    const sigma_y = 0;
    const tau_xy = tau_torsion;

    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const cos2 = cos * cos;
    const sin2 = sin * sin;

    // Transform to material coordinates (1-2 system)
    const sigma_1 = sigma_x * cos2 + sigma_y * sin2 + 2 * tau_xy * sin * cos;
    const sigma_2 = sigma_x * sin2 + sigma_y * cos2 - 2 * tau_xy * sin * cos;
    const tau_12 = (sigma_y - sigma_x) * sin * cos + tau_xy * (cos2 - sin2);

    // Calculate strains using material properties
    const E1 = material.E1;
    const E2 = material.E2;
    const G12 = material.G12;
    const nu12 = material.nu12;
    const nu21 = nu12 * E2 / E1;

    // Compliance matrix components (S matrix)
    const S11 = 1 / E1;
    const S12 = -nu12 / E1;
    const S22 = 1 / E2;
    const S66 = 1 / G12;

    // Strains in material coordinates
    const epsilon_1 = S11 * sigma_1 + S12 * sigma_2;
    const epsilon_2 = S12 * sigma_1 + S22 * sigma_2;
    const gamma_12 = S66 * tau_12;

    // Principal stresses (for global stress state)
    const sigma_avg = (sigma_x + sigma_y) / 2;
    const R = Math.sqrt(Math.pow((sigma_x - sigma_y) / 2, 2) + tau_xy * tau_xy);
    const sigma_principal_max = sigma_avg + R;
    const sigma_principal_min = sigma_avg - R;
    const tau_max = R;

    // von Mises stress
    const von_mises = Math.sqrt(
      sigma_1 * sigma_1 + sigma_2 * sigma_2 - sigma_1 * sigma_2 + 3 * tau_12 * tau_12
    );

    results.push({
      ply: index + 1,
      material: material.name,
      angle: ply.angle,
      sigma_1,
      sigma_2,
      tau_12,
      epsilon_1,
      epsilon_2,
      gamma_12,
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
