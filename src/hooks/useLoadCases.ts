import { useState } from 'react';
import { Loads } from '@/types/materials';

export interface LoadCase {
  id: string;
  name: string;
  description: string;
  loads: Loads;
  results?: {
    stress: any[];
    failure: any[];
  };
}

const defaultLoadCases: LoadCase[] = [
  {
    id: 'compression',
    name: 'Compression',
    description: 'Axial compression loading',
    loads: { Nx: -4750, Ny: 0, Nxy: 0, Mx: 0, My: 0, Mxy: 0 }
  },
  {
    id: 'tension',
    name: 'Tension',
    description: 'Axial tension loading',
    loads: { Nx: 4750, Ny: 0, Nxy: 0, Mx: 0, My: 0, Mxy: 0 }
  },
  {
    id: 'bending',
    name: 'Bending X',
    description: 'Pure bending moment about x-axis',
    loads: { Nx: 0, Ny: 0, Nxy: 0, Mx: 10000, My: 0, Mxy: 0 }
  },
  {
    id: 'torsion',
    name: 'Twisting',
    description: 'Pure twisting moment',
    loads: { Nx: 0, Ny: 0, Nxy: 0, Mx: 0, My: 0, Mxy: 5000 }
  },
  {
    id: 'combined',
    name: 'Combined Loading',
    description: 'Axial + Bending + Twisting',
    loads: { Nx: 3000, Ny: 0, Nxy: 0, Mx: 5000, My: 0, Mxy: 2000 }
  }
];

export function useLoadCases() {
  const [loadCases, setLoadCases] = useState<LoadCase[]>(defaultLoadCases);
  const [activeLoadCaseId, setActiveLoadCaseId] = useState<string>('compression');

  const addLoadCase = (loadCase: Omit<LoadCase, 'id'>) => {
    const newLoadCase: LoadCase = {
      ...loadCase,
      id: `custom-${Date.now()}`
    };
    setLoadCases(prev => [...prev, newLoadCase]);
    return newLoadCase.id;
  };

  const updateLoadCase = (id: string, updates: Partial<LoadCase>) => {
    setLoadCases(prev =>
      prev.map(lc => lc.id === id ? { ...lc, ...updates } : lc)
    );
  };

  const deleteLoadCase = (id: string) => {
    setLoadCases(prev => prev.filter(lc => lc.id !== id));
    if (activeLoadCaseId === id) {
      setActiveLoadCaseId(loadCases[0]?.id || '');
    }
  };

  const getActiveLoadCase = () => {
    return loadCases.find(lc => lc.id === activeLoadCaseId);
  };

  return {
    loadCases,
    activeLoadCaseId,
    setActiveLoadCaseId,
    addLoadCase,
    updateLoadCase,
    deleteLoadCase,
    getActiveLoadCase
  };
}
