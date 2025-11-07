import { Material, Ply } from '@/types/materials';
import { GeometryConfig } from '@/types/geometry';
import { calculateABDMatrix } from './abdMatrix';

// Matrix inversion for 6x6 ABD matrix
function invertMatrix6x6(ABD: number[][]): number[][] {
  const n = 6;
  const augmented: number[][] = ABD.map((row, i) => [
    ...row,
    ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))
  ]);

  // Gaussian elimination with partial pivoting
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    const pivot = augmented[i][i];
    if (Math.abs(pivot) < 1e-10) {
      throw new Error('Matrix is singular');
    }

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

  return augmented.map(row => row.slice(n));
}

// Calculate mid-plane strains and curvatures from loads using ABD matrix
export function calculateStrainsAndCurvatures(
  ABDMatrix: { A: number[][], B: number[][], D: number[][] },
  loads: { Nx: number, Ny: number, Nxy: number, Mx: number, My: number, Mxy: number }
): { strains: number[], curvatures: number[] } {
  // Build full 6x6 ABD matrix
  const ABD: number[][] = [
    [...ABDMatrix.A[0], ...ABDMatrix.B[0]],
    [...ABDMatrix.A[1], ...ABDMatrix.B[1]],
    [...ABDMatrix.A[2], ...ABDMatrix.B[2]],
    [...ABDMatrix.B[0], ...ABDMatrix.D[0]],
    [...ABDMatrix.B[1], ...ABDMatrix.D[1]],
    [...ABDMatrix.B[2], ...ABDMatrix.D[2]]
  ];

  // Invert ABD to get compliance matrix
  const compliance = invertMatrix6x6(ABD);

  // Load vector [Nx, Ny, Nxy, Mx, My, Mxy]
  const loadVector = [loads.Nx, loads.Ny, loads.Nxy, loads.Mx, loads.My, loads.Mxy];

  // Calculate strains and curvatures: [ε°, κ] = [ABD]^-1 * [N, M]
  const result = compliance.map(row =>
    row.reduce((sum, val, i) => sum + val * loadVector[i], 0)
  );

  return {
    strains: result.slice(0, 3),    // ε°x, ε°y, γ°xy
    curvatures: result.slice(3, 6)  // κx, κy, κxy
  };
}

// Calculate through-thickness position for each ply
export function calculatePlyPositions(
  plies: Ply[],
  materials: Record<string, Material>
): { z_bottom: number, z_top: number }[] {
  const totalThickness = plies.reduce(
    (sum, ply) => sum + (materials[ply.material]?.thickness || 0),
    0
  );
  
  const z_mid = -totalThickness / 2; // Start from bottom
  const positions: { z_bottom: number, z_top: number }[] = [];
  
  let currentZ = z_mid;
  plies.forEach(ply => {
    const t = materials[ply.material]?.thickness || 0;
    positions.push({
      z_bottom: currentZ,
      z_top: currentZ + t
    });
    currentZ += t;
  });
  
  return positions;
}

// No load transformation functions needed - loads are now input directly

// Calculate strains at a given z-position
export function calculateStrainsAtZ(
  z: number,
  strains: number[],
  curvatures: number[]
): { epsilon_x: number, epsilon_y: number, gamma_xy: number } {
  return {
    epsilon_x: strains[0] + z * curvatures[0],
    epsilon_y: strains[1] + z * curvatures[1],
    gamma_xy: strains[2] + z * curvatures[2]
  };
}

// Transform global strains to material coordinates
export function transformStrainsToMaterial(
  epsilon_x: number,
  epsilon_y: number,
  gamma_xy: number,
  angle: number
): { epsilon_1: number, epsilon_2: number, gamma_12: number } {
  const theta = angle * Math.PI / 180;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const c2 = c * c;
  const s2 = s * s;

  const epsilon_1 = epsilon_x * c2 + epsilon_y * s2 + gamma_xy * s * c;
  const epsilon_2 = epsilon_x * s2 + epsilon_y * c2 - gamma_xy * s * c;
  const gamma_12 = -2 * (epsilon_x - epsilon_y) * s * c + gamma_xy * (c2 - s2);

  return { epsilon_1, epsilon_2, gamma_12 };
}

// Calculate stresses from strains in material coordinates
export function calculateStressesFromStrains(
  epsilon_1: number,
  epsilon_2: number,
  gamma_12: number,
  material: Material
): { sigma_1: number, sigma_2: number, tau_12: number } {
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

  const sigma_1 = Q11 * epsilon_1 + Q12 * epsilon_2;
  const sigma_2 = Q12 * epsilon_1 + Q22 * epsilon_2;
  const tau_12 = Q66 * gamma_12;

  return { sigma_1, sigma_2, tau_12 };
}
