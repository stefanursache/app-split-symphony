import { Material, Ply } from '@/types/materials';

export interface ABDMatrix {
  A: number[][];
  B: number[][];
  D: number[][];
}

export function calculateABDMatrix(
  plies: Ply[],
  materials: Record<string, Material>
): ABDMatrix {
  const A: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const B: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const D: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

  if (plies.length === 0) {
    return { A, B, D };
  }

  // Calculate total thickness to determine midplane
  const totalThickness = plies.reduce((sum, ply) => {
    const material = materials[ply.material];
    return sum + (material?.thickness || 0);
  }, 0);

  const h0 = -totalThickness / 2;
  let z = h0;

  plies.forEach((ply) => {
    const material = materials[ply.material];
    if (!material) return;

    const t = material.thickness;
    const angleRad = ply.angle * Math.PI / 180;
    
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    const c2 = c * c;
    const s2 = s * s;
    const c4 = c2 * c2;
    const s4 = s2 * s2;
    
    // Calculate Q matrix (reduced stiffness matrix)
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
    
    // Transform Q to global coordinates (Q-bar)
    const Q11_bar = Q11 * c4 + 2 * (Q12 + 2 * Q66) * s2 * c2 + Q22 * s4;
    const Q12_bar = (Q11 + Q22 - 4 * Q66) * s2 * c2 + Q12 * (s4 + c4);
    const Q16_bar = (Q11 - Q12 - 2 * Q66) * s * c2 * c + (Q12 - Q22 + 2 * Q66) * s2 * s * c;
    const Q22_bar = Q11 * s4 + 2 * (Q12 + 2 * Q66) * s2 * c2 + Q22 * c4;
    const Q26_bar = (Q11 - Q12 - 2 * Q66) * s2 * s * c + (Q12 - Q22 + 2 * Q66) * s * c2 * c;
    const Q66_bar = (Q11 + Q22 - 2 * Q12 - 2 * Q66) * s2 * c2 + Q66 * (s4 + c4);
    
    const z1 = z + t;
    
    // A matrix (extensional stiffness)
    A[0][0] += Q11_bar * t;
    A[0][1] += Q12_bar * t;
    A[0][2] += Q16_bar * t;
    A[1][0] += Q12_bar * t;
    A[1][1] += Q22_bar * t;
    A[1][2] += Q26_bar * t;
    A[2][0] += Q16_bar * t;
    A[2][1] += Q26_bar * t;
    A[2][2] += Q66_bar * t;
    
    // B matrix (coupling stiffness)
    B[0][0] += 0.5 * Q11_bar * (z1 * z1 - z * z);
    B[0][1] += 0.5 * Q12_bar * (z1 * z1 - z * z);
    B[0][2] += 0.5 * Q16_bar * (z1 * z1 - z * z);
    B[1][0] += 0.5 * Q12_bar * (z1 * z1 - z * z);
    B[1][1] += 0.5 * Q22_bar * (z1 * z1 - z * z);
    B[1][2] += 0.5 * Q26_bar * (z1 * z1 - z * z);
    B[2][0] += 0.5 * Q16_bar * (z1 * z1 - z * z);
    B[2][1] += 0.5 * Q26_bar * (z1 * z1 - z * z);
    B[2][2] += 0.5 * Q66_bar * (z1 * z1 - z * z);
    
    // D matrix (bending stiffness)
    D[0][0] += (1/3) * Q11_bar * (z1 * z1 * z1 - z * z * z);
    D[0][1] += (1/3) * Q12_bar * (z1 * z1 * z1 - z * z * z);
    D[0][2] += (1/3) * Q16_bar * (z1 * z1 * z1 - z * z * z);
    D[1][0] += (1/3) * Q12_bar * (z1 * z1 * z1 - z * z * z);
    D[1][1] += (1/3) * Q22_bar * (z1 * z1 * z1 - z * z * z);
    D[1][2] += (1/3) * Q26_bar * (z1 * z1 * z1 - z * z * z);
    D[2][0] += (1/3) * Q16_bar * (z1 * z1 * z1 - z * z * z);
    D[2][1] += (1/3) * Q26_bar * (z1 * z1 * z1 - z * z * z);
    D[2][2] += (1/3) * Q66_bar * (z1 * z1 * z1 - z * z * z);
    
    z = z1;
  });

  return { A, B, D };
}
