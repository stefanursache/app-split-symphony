import { Material } from '@/types/materials';

export const DEFAULT_MATERIALS: Record<string, Material> = {
  'Fiberglass EC9-136': {
    name: 'Fiberglass EC9-136',
    type: 'Glass Fiber',
    E1: 72000,
    E2: 72000,
    G12: 3000,
    nu12: 0.22,
    tensile_strength: 3450,
    compressive_strength: 1450,
    shear_strength: 45,
    thermal_resistance: 260,
    density: 1.9,
    thickness: 0.25,
    color: '#E8F4F8'
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
    color: '#2C2C2C'
  },
  'Aramid Kevlar Twill': {
    name: 'Aramid Kevlar Twill',
    type: 'Aramid Fiber',
    E1: 118000,
    E2: 118000,
    G12: 3000,
    nu12: 0.34,
    tensile_strength: 1970,
    compressive_strength: 400,
    shear_strength: 50,
    thermal_resistance: 260,
    density: 1.45,
    thickness: 0.20,
    color: '#FFE5B4'
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
