import { useState, useEffect } from 'react';
import { Material } from '@/types/materials';
import { loadMaterialsFromStorage, saveMaterialsToStorage, DEFAULT_MATERIALS } from '@/data/materials';

export function useMaterials() {
  const [materials, setMaterials] = useState<Record<string, Material>>(() => 
    loadMaterialsFromStorage()
  );

  useEffect(() => {
    saveMaterialsToStorage(materials);
  }, [materials]);

  const addMaterial = (material: Material) => {
    setMaterials(prev => ({
      ...prev,
      [material.name]: material
    }));
  };

  const updateMaterial = (oldName: string, material: Material) => {
    setMaterials(prev => {
      const newMaterials = { ...prev };
      if (oldName !== material.name) {
        delete newMaterials[oldName];
      }
      newMaterials[material.name] = material;
      return newMaterials;
    });
  };

  const deleteMaterial = (name: string) => {
    setMaterials(prev => {
      const newMaterials = { ...prev };
      delete newMaterials[name];
      return newMaterials;
    });
  };

  return {
    materials,
    addMaterial,
    updateMaterial,
    deleteMaterial
  };
}
