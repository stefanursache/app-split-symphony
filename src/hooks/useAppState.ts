import { useState } from 'react';
import { AppState, Ply } from '@/types/materials';

const initialState: AppState = {
  plies: [],
  selectedMaterial: 'Fiberglass EC9-136',
  loads: {
    Nx: 4750,
    Ny: 0,
    Nxy: 0,
    Mx: 0,
    My: 0,
    Mxy: 0
  },
  activeTab: 'properties',
  activeLoadCase: 'compression',
  comparisonConfigs: [],
  safetyFactor: 1.5,
  failureCriterion: 'max_stress',
  editingMaterial: null,
  outerDiameter: 130,
  innerDiameter: 124,
  operatingTemp: "-40°C to 60°C",
  geometryType: 'tube',
  plateWidth: 100,
  enableThermalAnalysis: false,
  enableBucklingAnalysis: false,
  deltaT: 0
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

  const updatePly = (index: number, angle: number) => {
    setState(prev => ({
      ...prev,
      plies: prev.plies.map((ply, i) => 
        i === index ? { ...ply, angle } : ply
      )
    }));
  };

  const clearPlies = () => {
    console.log('🔴 CLEAR PLIES CALLED', new Error().stack);
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
    updatePly,
    clearPlies,
    updateLoads,
    setActiveTab,
    setSelectedMaterial,
    setState
  };
}
