import { ABDMatrix } from './abdMatrix';
import { Loads } from '@/types/materials';

export interface BucklingResult {
  critical_load_Nx: number | null;
  critical_load_Ny: number | null;
  critical_load_Nxy: number | null;
  buckling_factor: number | null;
  buckling_mode: string;
  is_buckling_concern: boolean;
}

export function calculateBucklingLoads(
  ABDMatrix: ABDMatrix,
  loads: Loads,
  geometryType: 'plate' | 'tube',
  dimensions: { a?: number; b?: number; outerDiameter?: number; length?: number }
): BucklingResult {
  const { D } = ABDMatrix;
  
  // Check if we have compression loads
  const hasCompression = loads.Nx < 0 || loads.Ny < 0;
  
  if (!hasCompression) {
    return {
      critical_load_Nx: null,
      critical_load_Ny: null,
      critical_load_Nxy: null,
      buckling_factor: null,
      buckling_mode: 'No compression loading',
      is_buckling_concern: false
    };
  }

  let critical_load_Nx: number | null = null;
  let critical_load_Ny: number | null = null;
  let critical_load_Nxy: number | null = null;
  let buckling_factor: number | null = null;
  let buckling_mode = '';

  if (geometryType === 'plate') {
    // Simply supported rectangular plate buckling
    const a = dimensions.a || 1000; // Default plate length in mm
    const b = dimensions.b || 1000; // Default plate width in mm
    
    // For orthotropic plates with simply supported edges
    // Critical buckling load for uniaxial compression (Nx)
    if (loads.Nx < 0) {
      const m = 1; // Number of half-waves in x-direction
      const n = 1; // Number of half-waves in y-direction
      
      const term1 = (m * Math.PI / a) ** 2;
      const term2 = (n * Math.PI / b) ** 2;
      
      // Nx_cr = π²/b² * (D11*(m*b/n*a)⁴ + 2*(D12+2*D66)*(m*b/n*a)² + D22)
      const ratio = (m * b) / (n * a);
      critical_load_Nx = -(Math.PI ** 2 / (b ** 2)) * (
        D[0][0] * (ratio ** 4) +
        2 * (D[0][1] + 2 * D[2][2]) * (ratio ** 2) +
        D[1][1]
      );
      
      buckling_mode = `Nx buckling (m=${m}, n=${n})`;
    }
    
    // Critical buckling load for uniaxial compression (Ny)
    if (loads.Ny < 0) {
      const m = 1;
      const n = 1;
      
      const ratio = (n * a) / (m * b);
      critical_load_Ny = -(Math.PI ** 2 / (a ** 2)) * (
        D[1][1] * (ratio ** 4) +
        2 * (D[0][1] + 2 * D[2][2]) * (ratio ** 2) +
        D[0][0]
      );
      
      if (!buckling_mode) {
        buckling_mode = `Ny buckling (m=${m}, n=${n})`;
      }
    }
    
    // Shear buckling
    if (loads.Nxy !== 0) {
      const k_s = 5.35; // Shear buckling coefficient for simply supported plate
      const D_s = Math.sqrt(D[0][0] * D[1][1]);
      critical_load_Nxy = k_s * Math.PI ** 2 * D_s / (Math.min(a, b) ** 2);
      
      if (!buckling_mode) {
        buckling_mode = 'Shear buckling';
      }
    }
    
  } else if (geometryType === 'tube') {
    // Cylindrical shell buckling
    const R = (dimensions.outerDiameter || 100) / 2; // Radius in mm
    const L = dimensions.length || 1000; // Length in mm
    
    // Calculate equivalent thickness from D matrix
    const D_eq = Math.pow(D[0][0] * D[1][1] * D[1][1] * D[1][1], 0.25);
    const h_eq = Math.pow(12 * D_eq, 1/3);
    
    // Axial compression buckling (Donnell's formula)
    if (loads.Nx < 0) {
      critical_load_Nx = -(2 * Math.PI * Math.sqrt(D[0][0] * D[1][1])) / R;
      buckling_mode = 'Axial compression buckling';
    }
    
    // Hoop compression buckling
    if (loads.Ny < 0) {
      const n = Math.round(1.5 * Math.sqrt(R / h_eq)); // Optimal number of circumferential waves
      critical_load_Ny = -(D[1][1] / R ** 2) * (n ** 2 - 1) ** 2;
      
      if (!buckling_mode) {
        buckling_mode = `Hoop buckling (n=${n} waves)`;
      }
    }
    
    // Torsional buckling
    if (loads.Nxy !== 0) {
      critical_load_Nxy = (1 / R) * Math.sqrt(D[0][0] * D[1][1]);
      
      if (!buckling_mode) {
        buckling_mode = 'Torsional buckling';
      }
    }
  }

  // Calculate buckling factor (ratio of critical load to applied load)
  const factors: number[] = [];
  
  if (critical_load_Nx !== null && loads.Nx < 0) {
    factors.push(Math.abs(critical_load_Nx / loads.Nx));
  }
  if (critical_load_Ny !== null && loads.Ny < 0) {
    factors.push(Math.abs(critical_load_Ny / loads.Ny));
  }
  if (critical_load_Nxy !== null && loads.Nxy !== 0) {
    factors.push(Math.abs(critical_load_Nxy / loads.Nxy));
  }
  
  buckling_factor = factors.length > 0 ? Math.min(...factors) : null;
  
  const is_buckling_concern = buckling_factor !== null && buckling_factor < 1.5;

  return {
    critical_load_Nx,
    critical_load_Ny,
    critical_load_Nxy,
    buckling_factor,
    buckling_mode,
    is_buckling_concern
  };
}
