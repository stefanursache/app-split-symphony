export type GeometryType = 'plate' | 'tube';

export interface GeometryConfig {
  type: GeometryType;
  // For tubes - only innerDiameter needed, outer is calculated from ply stack
  innerDiameter?: number;
}

export const DEFAULT_GEOMETRY: GeometryConfig = {
  type: 'tube',
  innerDiameter: 124
};
