import { Material } from '@/types/materials';

export const DEFAULT_MATERIALS: Record<string, Material> = {
  'Fiberglass EC9-136': {
    name: 'Fiberglass EC9-136',
    type: 'Glass Fiber',
    E1: 40000,
    E2: 10000,
    G12: 3800,
    nu12: 0.30,
    tensile_strength: 1000,
    compressive_strength: 700,
    shear_strength: 70,
    thermal_resistance: 260,
    density: 2.0,
    thickness: 0.25,
    color: '#E8F4F8',
    alpha1: 7e-6,
    alpha2: 22e-6
  },
  'Carbon Fiber Twill': {
    name: 'Carbon Fiber Twill',
    type: 'Carbon Fiber',
    E1: 57000,
    E2: 57000,
    G12: 4500,
    nu12: 0.20,
    tensile_strength: 740,
    compressive_strength: 531,
    shear_strength: 61,
    thermal_resistance: 650,
    density: 1.9,
    thickness: 0.25,
    color: '#2C2C2C',
    alpha1: -0.5e-6,
    alpha2: 12e-6
  },
  'Aramid Kevlar Twill': {
    name: 'Aramid Kevlar Twill',
    type: 'Aramid Fiber',
    E1: 73000,
    E2: 5000,
    G12: 2200,
    nu12: 0.35,
    tensile_strength: 1400,
    compressive_strength: 300,
    shear_strength: 40,
    thermal_resistance: 260,
    density: 1.4,
    thickness: 0.20,
    color: '#FFE5B4',
    alpha1: -1e-6,
    alpha2: 50e-6
  }
};

export function loadMaterialsFromStorage(): Record<string, Material> {
  const savedMaterials = localStorage.getItem('materialsDB');
  if (savedMaterials) {
    try {
      return JSON.parse(savedMaterials);
    } catch (e) {
      console.error('Failed to load materials from storage', e);
      return DEFAULT_MATERIALS;
    }
  }
  return DEFAULT_MATERIALS;
}

export function saveMaterialsToStorage(materials: Record<string, Material>) {
  localStorage.setItem('materialsDB', JSON.stringify(materials));
}
