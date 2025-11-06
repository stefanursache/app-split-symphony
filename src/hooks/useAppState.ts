import { useState } from 'react';
import { AppState, Ply } from '@/types/materials';

const initialState: AppState = {
  plies: [],
  selectedMaterial: 'Fiberglass EC9-136',
  loads: {
    axial: 4750,
    bending: 0,
    torsion: 0
  },
  activeTab: 'properties',
  activeLoadCase: 'compression',
  comparisonConfigs: [],
  safetyFactor: 1.5,
  failureCriterion: 'max_stress',
  editingMaterial: null,
  outerDiameter: 130,
  innerDiameter: 124,
  operatingTemp: "-40°C to 60°C"
};

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);

  const addPly = (material: string, angle: number) => {
    setState(prev => ({
      ...prev,
      plies: [...prev.plies, { material, angle }]
    }));
  };

  const removePly = (index: number) => {
    setState(prev => ({
      ...prev,
      plies: prev.plies.filter((_, i) => i !== index)
    }));
  };

  const clearPlies = () => {
    setState(prev => ({
      ...prev,
      plies: []
    }));
  };

  const updateLoads = (loads: Partial<AppState['loads']>) => {
    setState(prev => ({
      ...prev,
      loads: { ...prev.loads, ...loads }
    }));
  };

  const setActiveTab = (tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  const setSelectedMaterial = (material: string) => {
    setState(prev => ({ ...prev, selectedMaterial: material }));
  };

  return {
    state,
    addPly,
    removePly,
    clearPlies,
    updateLoads,
    setActiveTab,
    setSelectedMaterial,
    setState
  };
}
