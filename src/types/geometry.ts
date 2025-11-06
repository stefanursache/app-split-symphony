export type GeometryType = 'plate' | 'tube';

export interface GeometryConfig {
  type: GeometryType;
  // For tubes
  outerDiameter?: number;
  innerDiameter?: number;
  // For plates
  width?: number;
  length?: number;
}

export const DEFAULT_GEOMETRY: GeometryConfig = {
  type: 'tube',
  outerDiameter: 130,
  innerDiameter: 124
};
