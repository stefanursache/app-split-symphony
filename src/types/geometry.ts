export type GeometryType = 'plate' | 'tube';

export interface GeometryConfig {
  type: GeometryType;
  // For tubes - only innerDiameter needed, outer is calculated from ply stack
  innerDiameter?: number;
  outerDiameter?: number;
  length?: number;
}

export const DEFAULT_GEOMETRY: GeometryConfig = {
  type: 'plate',
  innerDiameter: 124
};
