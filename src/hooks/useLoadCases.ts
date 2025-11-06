import { useState } from 'react';

export interface LoadCase {
  id: string;
  name: string;
  description: string;
  loads: {
    axial: number;
    bending: number;
    torsion: number;
  };
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
    loads: { axial: -4750, bending: 0, torsion: 0 }
  },
  {
    id: 'tension',
    name: 'Tension',
    description: 'Axial tension loading',
    loads: { axial: 4750, bending: 0, torsion: 0 }
  },
  {
    id: 'bending',
    name: 'Bending',
    description: 'Pure bending moment',
    loads: { axial: 0, bending: 10000, torsion: 0 }
  },
  {
    id: 'torsion',
    name: 'Torsion',
    description: 'Pure torsional loading',
    loads: { axial: 0, bending: 0, torsion: 5000 }
  },
  {
    id: 'combined',
    name: 'Combined Loading',
    description: 'Axial + Bending + Torsion',
    loads: { axial: 3000, bending: 5000, torsion: 2000 }
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
