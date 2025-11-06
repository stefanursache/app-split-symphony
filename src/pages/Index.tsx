import { useState, useMemo, useEffect } from 'react';
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
import { calculateEngineeringProperties, calculateStressStrain } from '@/utils/calculations';
import { calculateABDMatrix } from '@/utils/abdMatrix';
import { calculateFailureAnalysis, calculateSafetySummary, FailureResult } from '@/utils/failureAnalysis';
import { Material } from '@/types/materials';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

const Index = () => {
  const { materials, addMaterial, updateMaterial } = useMaterials();
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

  const selectedMaterialData = materials[state.selectedMaterial] || null;

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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
    if (oldName) {
      updateMaterial(oldName, material);
    } else {
      addMaterial(material);
    }
  };

  const handleCalculateStress = () => {
    const activeCase = getActiveLoadCase();
    if (!activeCase) return;

    const results = calculateStressStrain(
      state.plies,
      materials,
      activeCase.loads,
      state.outerDiameter
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

    // Store results in load case
    updateLoadCase(activeLoadCaseId, {
      results: {
        stress: results,
        failure: failureAnalysis
      }
    });
  };

  const handleRunLoadCase = (loadCaseId: string) => {
    setActiveLoadCaseId(loadCaseId);
    const loadCase = loadCases.find(lc => lc.id === loadCaseId);
    if (loadCase) {
      updateLoads(loadCase.loads);
      // Switch to stress tab and run analysis
      setActiveTab('stress');
      setTimeout(() => handleCalculateStress(), 100);
    }
  };

  const handleSaveConfiguration = (name: string, description: string) => {
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
              disabled={state.plies.length === 0}
              isUpdate={!!loadedConfigId}
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
                <TabsTrigger value="comparison">Compare</TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="mt-6 space-y-6">
                <ABDMatrixDisplay matrix={abdMatrix} />
                <EngineeringProperties properties={engineeringProps} />
                <CrossSectionVisualization plies={state.plies} materials={materials} />
              </TabsContent>

              <TabsContent value="stress" className="mt-6 space-y-6">
                <LoadInputs
                  loads={state.loads}
                  onUpdateLoads={updateLoads}
                  onCalculate={handleCalculateStress}
                />
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
                <FailureCriteriaSelector
                  failureCriterion={failureCriterion}
                  safetyFactor={safetyFactor}
                  onCriterionChange={(criterion) => setFailureCriterion(criterion as 'max_stress' | 'tsai_wu' | 'tsai_hill')}
                  onSafetyFactorChange={setSafetyFactor}
                />
                <PlyFailureAnalysis results={failureResults} />
                <SafetyMarginSummary summary={safetySummary} />
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
      />
    </div>
  );
};

export default Index;
