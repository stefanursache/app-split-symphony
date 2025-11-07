import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useMaterials } from '@/hooks/useMaterials';
import { useAppState } from '@/hooks/useAppState';
import { useConfigurations, Configuration } from '@/hooks/useConfigurations';
import { useLoadCases } from '@/hooks/useLoadCases';
import { toast } from 'sonner';
import { MaterialSelector } from '@/components/composite/MaterialSelector';
import { MaterialProperties } from '@/components/composite/MaterialProperties';
import { MaterialEditor } from '@/components/composite/MaterialEditor';
import { PlyStack } from '@/components/composite/PlyStack';
import { EngineeringProperties } from '@/components/composite/EngineeringProperties';
import { LoadInputs } from '@/components/composite/LoadInputs';
import { StressResults } from '@/components/composite/StressResults';
import { CrossSectionVisualization } from '@/components/composite/CrossSectionVisualization';
import { ABDMatrixDisplay } from '@/components/composite/ABDMatrixDisplay';
import { ConfigurationComparison } from '@/components/composite/ConfigurationComparison';
import { SaveConfigurationDialog } from '@/components/composite/SaveConfigurationDialog';
import { MathematicsExplanation } from '@/components/composite/MathematicsExplanation';
import { FailureCriteriaSelector } from '@/components/composite/FailureCriteriaSelector';
import { PlyFailureAnalysis } from '@/components/composite/PlyFailureAnalysis';
import { SafetyMarginSummary } from '@/components/composite/SafetyMarginSummary';
import { LaminateOptimizer } from '@/components/composite/LaminateOptimizer';
import { LoadCaseManager } from '@/components/composite/LoadCaseManager';
import { StressVisualization } from '@/components/composite/StressVisualization';
import { PDFReportExport } from '@/components/composite/PDFReportExport';
import { GeometrySelector } from '@/components/composite/GeometrySelector';
import { AdvancedAnalysisOptions } from '@/components/composite/AdvancedAnalysisOptions';
import { ThermalStressResults } from '@/components/composite/ThermalStressResults';
import { BucklingResults } from '@/components/composite/BucklingResults';
import { ProgressiveFailureResults } from '@/components/composite/ProgressiveFailureResults';
import { InterlaminarStressResults } from '@/components/composite/InterlaminarStressResults';
import { calculateEngineeringProperties, calculateStressStrain } from '@/utils/calculations';
import { calculateABDMatrix } from '@/utils/abdMatrix';
import { calculateFailureAnalysis, calculateSafetySummary, FailureResult } from '@/utils/failureAnalysis';
import { calculateThermalStresses, ThermalStressResult } from '@/utils/thermalAnalysis';
import { calculateBucklingLoads, BucklingResult } from '@/utils/bucklingAnalysis';
import { performProgressiveFailureAnalysis, ProgressiveFailureAnalysis } from '@/utils/progressiveFailure';
import { calculateInterlaminarStresses, InterlaminarStressResult } from '@/utils/interlaminarStress';
import { Material } from '@/types/materials';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { GeometryConfig } from '@/types/geometry';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const {
    state,
    addPly,
    removePly,
    updatePly,
    clearPlies,
    updateLoads,
    setActiveTab,
    setSelectedMaterial
  } = useAppState();
  const { configurations, loading: configsLoading, saveConfiguration, updateConfiguration, deleteConfiguration } = useConfigurations();
  const {
    loadCases,
    activeLoadCaseId,
    setActiveLoadCaseId,
    addLoadCase,
    updateLoadCase,
    deleteLoadCase,
    getActiveLoadCase
  } = useLoadCases();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [stressResults, setStressResults] = useState<any[]>([]);
  const [failureResults, setFailureResults] = useState<FailureResult[]>([]);
  const [safetyFactor, setSafetyFactor] = useState(1.5);
  const [failureCriterion, setFailureCriterion] = useState<'max_stress' | 'tsai_wu' | 'tsai_hill'>('max_stress');
  const [loadedConfigId, setLoadedConfigId] = useState<string | null>(null);
  const [geometry, setGeometry] = useState<GeometryConfig>({
    type: 'tube',
    innerDiameter: state.innerDiameter
  });
  
  // Advanced analysis state
  const [enableThermalAnalysis, setEnableThermalAnalysis] = useState(false);
  const [enableBucklingAnalysis, setEnableBucklingAnalysis] = useState(false);
  const [deltaT, setDeltaT] = useState(0);
  const [thermalResults, setThermalResults] = useState<ThermalStressResult[]>([]);
  const [bucklingResult, setBucklingResult] = useState<BucklingResult | null>(null);
  const [progressiveFailureAnalysis, setProgressiveFailureAnalysis] = useState<ProgressiveFailureAnalysis | null>(null);
  const [interlaminarResults, setInterlaminarResults] = useState<InterlaminarStressResult[]>([]);

  const selectedMaterialData = materials[state.selectedMaterial] || null;

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Auth check - allow guest access
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const engineeringProps = useMemo(() => {
    return calculateEngineeringProperties(state.plies, materials);
  }, [state.plies, materials]);

  const abdMatrix = useMemo(() => {
    return calculateABDMatrix(state.plies, materials);
  }, [state.plies, materials]);

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setIsEditorOpen(true);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleEditMaterial = (name: string) => {
    setEditingMaterial(materials[name]);
    setIsEditorOpen(true);
  };

  const handleSaveMaterial = (material: Material, oldName?: string) => {
    if (!user) {
      toast.error('Please sign in to save materials');
      return;
    }
    if (oldName) {
      updateMaterial(oldName, material);
    } else {
      addMaterial(material);
    }
  };

  const handleDeleteMaterial = (materialName: string) => {
    if (!user) {
      toast.error('Please sign in to delete materials');
      return;
    }
    deleteMaterial(materialName);
    toast.success('Material deleted successfully');
  };

  const handleCalculateStress = (createNewCase: boolean = false) => {
    if (state.plies.length === 0) {
      toast.error('Please add plies before calculating');
      return;
    }

    const results = calculateStressStrain(
      state.plies,
      materials,
      state.loads,
      geometry
    );
    setStressResults(results);

    // Calculate failure analysis
    const failureAnalysis = calculateFailureAnalysis(
      state.plies,
      materials,
      results,
      safetyFactor,
      failureCriterion
    );
    setFailureResults(failureAnalysis);

    // Thermal stress analysis (optional)
    if (enableThermalAnalysis && deltaT !== 0) {
      const thermal = calculateThermalStresses(state.plies, materials, deltaT);
      setThermalResults(thermal);
    } else {
      setThermalResults([]);
    }

    // Buckling analysis (optional)
    if (enableBucklingAnalysis) {
      const buckling = calculateBucklingLoads(
        calculateABDMatrix(state.plies, materials),
        state.loads,
        geometry.type,
        {
          a: 1000,
          b: 1000,
          outerDiameter: geometry.outerDiameter || 100,
          length: geometry.length || 1000
        }
      );
      setBucklingResult(buckling);
    } else {
      setBucklingResult(null);
    }

    // Progressive failure analysis (default)
    const progressive = performProgressiveFailureAnalysis(
      state.plies,
      materials,
      state.loads,
      safetyFactor,
      failureCriterion,
      geometry.type,
      geometry.outerDiameter || 100,
      geometry.innerDiameter || 90
    );
    setProgressiveFailureAnalysis(progressive);

    // Interlaminar stress analysis (default)
    const interlaminar = calculateInterlaminarStresses(state.plies, materials, state.loads);
    setInterlaminarResults(interlaminar);

    if (createNewCase) {
      // Check if a similar load case already exists
      const existingCase = loadCases.find(lc => 
        lc.loads.Nx === state.loads.Nx &&
        lc.loads.Ny === state.loads.Ny &&
        lc.loads.Nxy === state.loads.Nxy &&
        lc.loads.Mx === state.loads.Mx &&
        lc.loads.My === state.loads.My &&
        lc.loads.Mxy === state.loads.Mxy
      );

      if (existingCase) {
        // Update existing similar load case instead of creating new one
        updateLoadCase(existingCase.id, {
          results: {
            stress: results,
            failure: failureAnalysis
          }
        });
        setActiveLoadCaseId(existingCase.id);
        toast.info(`Updated existing load case: ${existingCase.name}`);
      } else {
        // Create a new load case with the results
        const newCaseId = addLoadCase({
          name: `Case ${loadCases.length + 1}`,
          description: `Nx: ${state.loads.Nx}N/mm, Ny: ${state.loads.Ny}N/mm, Nxy: ${state.loads.Nxy}N/mm, Mx: ${state.loads.Mx}N, My: ${state.loads.My}N, Mxy: ${state.loads.Mxy}N`,
          loads: { ...state.loads },
          results: {
            stress: results,
            failure: failureAnalysis
          }
        });
        setActiveLoadCaseId(newCaseId);
        toast.success('New load case created');
      }
    } else {
      // Update existing load case
      updateLoadCase(activeLoadCaseId, {
        results: {
          stress: results,
          failure: failureAnalysis
        }
      });
    }
  };

  const handleRunLoadCase = (loadCaseId: string) => {
    setActiveLoadCaseId(loadCaseId);
    const loadCase = loadCases.find(lc => lc.id === loadCaseId);
    if (loadCase) {
      updateLoads(loadCase.loads);
      // Switch to stress tab and run analysis
      setActiveTab('stress');
      setTimeout(() => handleCalculateStress(false), 100);
    }
  };

  // Auto-calculate when active load case changes
  useEffect(() => {
    const activeCase = getActiveLoadCase();
    if (activeCase && state.plies.length > 0) {
      updateLoads(activeCase.loads);
      handleCalculateStress(false);
    }
  }, [activeLoadCaseId]);

  const handleSaveConfiguration = (name: string, description: string) => {
    if (!user) {
      toast.error('Please sign in to save configurations');
      return;
    }
    
    const totalThickness = state.plies.reduce((sum, ply) => {
      const material = materials[ply.material];
      return sum + (material?.thickness || 0);
    }, 0);

    const totalWeight = state.plies.reduce((sum, ply) => {
      const material = materials[ply.material];
      return sum + (material ? material.density * material.thickness : 0);
    }, 0);

    if (loadedConfigId) {
      // Update existing configuration
      updateConfiguration(
        loadedConfigId,
        name,
        description,
        state.plies,
        engineeringProps,
        totalThickness,
        totalWeight
      );
    } else {
      // Save new configuration
      saveConfiguration(
        name,
        description,
        state.plies,
        engineeringProps,
        totalThickness,
        totalWeight
      );
    }
    setLoadedConfigId(null);
  };

  const handleAddCurrentToComparison = () => {
    const totalThickness = state.plies.reduce((sum, ply) => {
      const material = materials[ply.material];
      return sum + (material?.thickness || 0);
    }, 0);

    const totalWeight = state.plies.reduce((sum, ply) => {
      const material = materials[ply.material];
      return sum + (material ? material.density * material.thickness : 0);
    }, 0);

  return {
    id: 'current',
    name: 'Current Design',
    description: null,
    plies: state.plies,
    engineering_properties: engineeringProps,
    total_thickness: totalThickness,
    total_weight: totalWeight,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Configuration;
  };

  const safetySummary = useMemo(() => {
    return calculateSafetySummary(failureResults, safetyFactor);
  }, [failureResults, safetyFactor]);

  const handleApplyOptimization = (plies: any[]) => {
    clearPlies();
    plies.forEach(ply => addPly(ply.material, ply.angle));
    setLoadedConfigId(null); // Reset loaded config when applying optimization
  };

  const handleLoadConfiguration = (config: Configuration) => {
    clearPlies();
    config.plies.forEach(ply => addPly(ply.material, ply.angle));
    setLoadedConfigId(config.id);
    toast.success(`Loaded configuration: ${config.name}`);
  };

  const handleDeleteConfiguration = (id: string) => {
    if (loadedConfigId === id) {
      setLoadedConfigId(null);
    }
    deleteConfiguration(id);
  };

  const handleNewConfiguration = () => {
    clearPlies();
    setLoadedConfigId(null);
    setStressResults([]);
    setFailureResults([]);
    toast.success('Started new configuration');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Composite Laminate Structural Analysis
              </h1>
              <p className="text-muted-foreground mt-1">
                Hybrid Composite Design Tool
              </p>
            </div>
            <div className="flex items-center gap-3">
              <PDFReportExport
                plies={state.plies}
                materials={materials}
                abdMatrix={abdMatrix}
                engineeringProps={engineeringProps}
                stressResults={stressResults}
                failureResults={failureResults}
                loadCase={getActiveLoadCase()}
              />
              {user ? (
                <Button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    toast.success('Signed out successfully');
                  }}
                  variant="outline"
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  variant="default"
                >
                  Sign In
                </Button>
              )}
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <MaterialSelector
              materials={materials}
              selectedMaterial={state.selectedMaterial}
              onSelectMaterial={setSelectedMaterial}
              onEditMaterial={handleEditMaterial}
              onAddMaterial={handleAddMaterial}
              isAuthenticated={!!user}
            />
            
            <MaterialProperties material={selectedMaterialData} />
            
            <PlyStack
              plies={state.plies}
              materials={materials}
              selectedMaterial={state.selectedMaterial}
              onAddPly={addPly}
              onRemovePly={removePly}
              onUpdatePly={updatePly}
              onClearPlies={clearPlies}
            />

            <SaveConfigurationDialog
              onSave={handleSaveConfiguration}
              onNewConfig={handleNewConfiguration}
              disabled={state.plies.length === 0}
              isUpdate={!!loadedConfigId}
              requiresAuth={!user}
            />
          </div>

          {/* Right Panel - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={state.activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="stress">Stress</TabsTrigger>
                <TabsTrigger value="visualization">Visualization</TabsTrigger>
                <TabsTrigger value="failure">Failure</TabsTrigger>
                <TabsTrigger value="loadcases">Load Cases</TabsTrigger>
                <TabsTrigger value="optimize">Optimize</TabsTrigger>
                <TabsTrigger value="comparison">Stacks</TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="mt-6 space-y-6">
                <ABDMatrixDisplay matrix={abdMatrix} />
                <EngineeringProperties properties={engineeringProps} />
                <CrossSectionVisualization plies={state.plies} materials={materials} />
              </TabsContent>

              <TabsContent value="stress" className="mt-6 space-y-6">
                <GeometrySelector
                  geometry={geometry}
                  onGeometryChange={setGeometry}
                  totalThickness={engineeringProps.thickness}
                />
                <LoadInputs
                  loads={state.loads}
                  onLoadChange={updateLoads}
                />
                <Button 
                  onClick={() => handleCalculateStress(true)} 
                  className="w-full"
                  disabled={state.plies.length === 0}
                >
                  Calculate Stress/Strain
                </Button>
                <StressResults results={stressResults} />
              </TabsContent>

              <TabsContent value="visualization" className="mt-6 space-y-6">
                <StressVisualization
                  plies={state.plies}
                  materials={materials}
                  stressResults={stressResults}
                />
                <MathematicsExplanation plies={state.plies} materials={materials} />
              </TabsContent>

              <TabsContent value="failure" className="mt-6 space-y-6">
                <AdvancedAnalysisOptions
                  enableThermalAnalysis={enableThermalAnalysis}
                  enableBucklingAnalysis={enableBucklingAnalysis}
                  deltaT={deltaT}
                  onThermalToggle={setEnableThermalAnalysis}
                  onBucklingToggle={setEnableBucklingAnalysis}
                  onDeltaTChange={setDeltaT}
                />
                <FailureCriteriaSelector
                  failureCriterion={failureCriterion}
                  safetyFactor={safetyFactor}
                  onCriterionChange={(criterion) => setFailureCriterion(criterion as 'max_stress' | 'tsai_wu' | 'tsai_hill')}
                  onSafetyFactorChange={setSafetyFactor}
                />
                <PlyFailureAnalysis results={failureResults} />
                <SafetyMarginSummary summary={safetySummary} />
                {enableThermalAnalysis && thermalResults.length > 0 && (
                  <ThermalStressResults results={thermalResults} deltaT={deltaT} />
                )}
                {enableBucklingAnalysis && bucklingResult && (
                  <BucklingResults result={bucklingResult} />
                )}
                {progressiveFailureAnalysis && (
                  <ProgressiveFailureResults analysis={progressiveFailureAnalysis} />
                )}
                {interlaminarResults.length > 0 && (
                  <InterlaminarStressResults results={interlaminarResults} />
                )}
              </TabsContent>

              <TabsContent value="loadcases" className="mt-6">
                <LoadCaseManager
                  loadCases={loadCases}
                  activeLoadCaseId={activeLoadCaseId}
                  onSelectLoadCase={setActiveLoadCaseId}
                  onAddLoadCase={addLoadCase}
                  onDeleteLoadCase={deleteLoadCase}
                  onRunAnalysis={handleRunLoadCase}
                />
              </TabsContent>

              <TabsContent value="optimize" className="mt-6">
                <LaminateOptimizer
                  currentPlies={state.plies}
                  materials={materials}
                  onApplySuggestion={handleApplyOptimization}
                />
              </TabsContent>

              <TabsContent value="comparison" className="mt-6">
                <ConfigurationComparison
                  configurations={configurations}
                  loading={configsLoading}
                  currentConfig={state.plies.length > 0 ? handleAddCurrentToComparison() : null}
                  onAddCurrent={() => {}}
                  onLoadConfig={handleLoadConfiguration}
                  onDeleteConfig={handleDeleteConfiguration}
                  isAuthenticated={!!user}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <MaterialEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        material={editingMaterial}
        onSave={handleSaveMaterial}
        onDelete={handleDeleteMaterial}
        isAuthenticated={!!user}
      />
    </div>
  );
};

export default Index;
