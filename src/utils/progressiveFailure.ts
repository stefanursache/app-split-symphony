import { Material, Ply, Loads, StressResult } from '@/types/materials';
import { calculateStressStrain } from './calculations';
import { calculateFailureAnalysis, FailureResult } from './failureAnalysis';

export interface ProgressiveFailureStep {
  iteration: number;
  failedPlies: number[];
  maxFailureIndex: number;
  criticalPly: number;
  degradedMaterials: Record<string, Material>;
  stressResults: StressResult[];
  failureResults: FailureResult[];
}

export interface ProgressiveFailureAnalysis {
  steps: ProgressiveFailureStep[];
  firstPlyFailure: {
    ply: number;
    iteration: number;
    failureIndex: number;
  } | null;
  lastPlyFailure: {
    ply: number;
    iteration: number;
    loadMultiplier: number;
  } | null;
  ultimateStrength: number;
}

const DEGRADATION_FACTOR = 0.01; // Reduce failed ply stiffness to 1% of original

export function performProgressiveFailureAnalysis(
  plies: Ply[],
  materials: Record<string, Material>,
  loads: Loads,
  safetyFactor: number,
  failureCriterion: 'max_stress' | 'tsai_wu' | 'tsai_hill',
  geometryType: 'plate' | 'tube',
  outerDiameter: number,
  innerDiameter: number,
  maxIterations: number = 100
): ProgressiveFailureAnalysis {
  // CRITICAL: Create a deep copy of plies to avoid mutating the original array
  const workingPlies: Ply[] = plies.map(ply => ({ ...ply }));
  
  const steps: ProgressiveFailureStep[] = [];
  let currentMaterials = { ...materials };
  let failedPlies = new Set<number>();
  let iteration = 0;
  let firstPlyFailure: ProgressiveFailureAnalysis['firstPlyFailure'] = null;
  let lastPlyFailure: ProgressiveFailureAnalysis['lastPlyFailure'] = null;
  let loadMultiplier = 1.0;

  // Initial analysis
  const geometry = {
    type: geometryType,
    outerDiameter,
    innerDiameter,
    length: 1000
  };
  
  let stressResults = calculateStressStrain(workingPlies, currentMaterials, loads, geometry);
  let failureResults = calculateFailureAnalysis(
    workingPlies,
    currentMaterials,
    stressResults,
    safetyFactor,
    failureCriterion
  );

  // Find maximum failure index
  let maxFailureIndex = Math.max(...failureResults.map(r => r.failureIndex));
  let criticalPlyIndex = failureResults.findIndex(r => r.failureIndex === maxFailureIndex);

  // Store initial step
  steps.push({
    iteration: 0,
    failedPlies: [],
    maxFailureIndex,
    criticalPly: criticalPlyIndex + 1,
    degradedMaterials: { ...currentMaterials },
    stressResults,
    failureResults
  });

  // Progressive failure loop
  while (iteration < maxIterations && failedPlies.size < workingPlies.length) {
    iteration++;

    // Check if any new plies have failed (failure index >= 1.0)
    let newFailure = false;
    failureResults.forEach((result, index) => {
      if (result.failureIndex >= 1.0 && !failedPlies.has(index)) {
        failedPlies.add(index);
        newFailure = true;

        // Record first ply failure
        if (!firstPlyFailure) {
          firstPlyFailure = {
            ply: index + 1,
            iteration,
            failureIndex: result.failureIndex
          };
        }

        // Degrade material properties for failed ply
        const plyMaterial = workingPlies[index].material;
        const originalMaterial = materials[plyMaterial];
        
        // Create degraded material (reduce stiffness)
        const degradedMaterial: Material = {
          ...originalMaterial,
          E1: originalMaterial.E1 * DEGRADATION_FACTOR,
          E2: originalMaterial.E2 * DEGRADATION_FACTOR,
          G12: originalMaterial.G12 * DEGRADATION_FACTOR
        };

        // Create unique degraded material name for this ply
        const degradedName = `${plyMaterial}_degraded_${index}`;
        currentMaterials[degradedName] = degradedMaterial;
        // Update WORKING COPY only, not the original!
        workingPlies[index].material = degradedName;
      }
    });

    if (!newFailure) {
      // No new failures, increase load
      loadMultiplier += 0.1;
      const scaledLoads: Loads = {
        Nx: loads.Nx * loadMultiplier,
        Ny: loads.Ny * loadMultiplier,
        Nxy: loads.Nxy * loadMultiplier,
        Mx: loads.Mx * loadMultiplier,
        My: loads.My * loadMultiplier,
        Mxy: loads.Mxy * loadMultiplier
      };

      // Recalculate with increased loads
      stressResults = calculateStressStrain(workingPlies, currentMaterials, scaledLoads, geometry);
      failureResults = calculateFailureAnalysis(
        workingPlies,
        currentMaterials,
        stressResults,
        safetyFactor,
        failureCriterion
      );
    } else {
      // Recalculate with current loads and degraded materials
      const currentLoads: Loads = {
        Nx: loads.Nx * loadMultiplier,
        Ny: loads.Ny * loadMultiplier,
        Nxy: loads.Nxy * loadMultiplier,
        Mx: loads.Mx * loadMultiplier,
        My: loads.My * loadMultiplier,
        Mxy: loads.Mxy * loadMultiplier
      };

      stressResults = calculateStressStrain(workingPlies, currentMaterials, currentLoads, geometry);
      failureResults = calculateFailureAnalysis(
        workingPlies,
        currentMaterials,
        stressResults,
        safetyFactor,
        failureCriterion
      );
    }

    maxFailureIndex = Math.max(...failureResults.map(r => r.failureIndex));
    criticalPlyIndex = failureResults.findIndex(r => r.failureIndex === maxFailureIndex);

    steps.push({
      iteration,
      failedPlies: Array.from(failedPlies).map(i => i + 1),
      maxFailureIndex,
      criticalPly: criticalPlyIndex + 1,
      degradedMaterials: { ...currentMaterials },
      stressResults,
      failureResults
    });

    // Check for complete failure (all plies failed or catastrophic failure)
    if (failedPlies.size === workingPlies.length || maxFailureIndex > 10) {
      lastPlyFailure = {
        ply: criticalPlyIndex + 1,
        iteration,
        loadMultiplier
      };
      break;
    }
  }

  const ultimateStrength = lastPlyFailure ? loadMultiplier : 1.0;

  return {
    steps,
    firstPlyFailure,
    lastPlyFailure,
    ultimateStrength
  };
}
