import { StressResult } from '@/types/materials';

export interface ExperimentalDataPoint {
  plyNumber: number;
  location: 'top' | 'bottom';
  epsilon_x?: number;
  epsilon_y?: number;
  gamma_xy?: number;
  sigma_x?: number;
  sigma_y?: number;
  tau_xy?: number;
}

export interface ValidationResult {
  plyNumber: number;
  location: 'top' | 'bottom';
  parameter: string;
  theoretical: number;
  experimental: number;
  error: number;
  percentError: number;
}

export function parseExperimentalData(csvContent: string): ExperimentalDataPoint[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain header and at least one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const data: ExperimentalDataPoint[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue;

    const point: ExperimentalDataPoint = {
      plyNumber: parseInt(values[headers.indexOf('plynumber')] || values[headers.indexOf('ply')]) || 0,
      location: (values[headers.indexOf('location')] || 'top').toLowerCase() as 'top' | 'bottom'
    };

    const parameterMap: Record<string, keyof ExperimentalDataPoint> = {
      'epsilon_x': 'epsilon_x',
      'epsilon_y': 'epsilon_y',
      'gamma_xy': 'gamma_xy',
      'sigma_x': 'sigma_x',
      'sigma_y': 'sigma_y',
      'tau_xy': 'tau_xy'
    };

    Object.entries(parameterMap).forEach(([csvKey, dataKey]) => {
      const idx = headers.indexOf(csvKey);
      if (idx !== -1 && values[idx]) {
        (point as any)[dataKey] = parseFloat(values[idx]);
      }
    });

    data.push(point);
  }

  return data;
}

export function validateExperimentalData(
  theoreticalResults: StressResult[],
  experimentalData: ExperimentalDataPoint[]
): ValidationResult[] {
  const validations: ValidationResult[] = [];

  experimentalData.forEach(expPoint => {
    const plyIndex = expPoint.plyNumber - 1;
    if (plyIndex < 0 || plyIndex >= theoreticalResults.length) return;

    const theoretical = theoreticalResults[plyIndex];
    const isTop = expPoint.location === 'top';

    const compareParameter = (
      paramName: string,
      expValue: number | undefined,
      theoValue: number
    ) => {
      if (expValue === undefined) return;

      const error = theoValue - expValue;
      const percentError = Math.abs(error / (expValue || 1)) * 100;

      validations.push({
        plyNumber: expPoint.plyNumber,
        location: expPoint.location,
        parameter: paramName,
        theoretical: theoValue,
        experimental: expValue,
        error,
        percentError
      });
    };

    // Material coordinate strains and stresses
    compareParameter('ε_1', expPoint.epsilon_x, isTop ? theoretical.epsilon_1_top : theoretical.epsilon_1_bottom);
    compareParameter('ε_2', expPoint.epsilon_y, isTop ? theoretical.epsilon_2_top : theoretical.epsilon_2_bottom);
    compareParameter('γ_12', expPoint.gamma_xy, isTop ? theoretical.gamma_12_top : theoretical.gamma_12_bottom);
    compareParameter('σ_1', expPoint.sigma_x, isTop ? theoretical.sigma_1_top : theoretical.sigma_1_bottom);
    compareParameter('σ_2', expPoint.sigma_y, isTop ? theoretical.sigma_2_top : theoretical.sigma_2_bottom);
    compareParameter('τ_12', expPoint.tau_xy, isTop ? theoretical.tau_12_top : theoretical.tau_12_bottom);
  });

  return validations;
}

export function calculateValidationMetrics(validations: ValidationResult[]) {
  if (validations.length === 0) {
    return { rmse: 0, meanError: 0, maxError: 0, meanPercentError: 0 };
  }

  const rmse = Math.sqrt(
    validations.reduce((sum, v) => sum + v.error * v.error, 0) / validations.length
  );

  const meanError = validations.reduce((sum, v) => sum + Math.abs(v.error), 0) / validations.length;
  const maxError = Math.max(...validations.map(v => Math.abs(v.error)));
  const meanPercentError = validations.reduce((sum, v) => sum + v.percentError, 0) / validations.length;

  return { rmse, meanError, maxError, meanPercentError };
}
