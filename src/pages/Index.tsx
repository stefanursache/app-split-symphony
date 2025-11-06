import { useState, useMemo, useEffect } from 'react';
import { useMaterials } from '@/hooks/useMaterials';
import { useAppState } from '@/hooks/useAppState';
import { useConfigurations, Configuration } from '@/hooks/useConfigurations';
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
import { calculateEngineeringProperties, calculateStressStrain } from '@/utils/calculations';
import { calculateABDMatrix } from '@/utils/abdMatrix';
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
    clearPlies,
    updateLoads,
    setActiveTab,
    setSelectedMaterial
  } = useAppState();
  const { configurations, loading: configsLoading, saveConfiguration } = useConfigurations();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [stressResults, setStressResults] = useState<any[]>([]);

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
    const results = calculateStressStrain(
      state.plies,
      materials,
      state.loads,
      state.outerDiameter
    );
    setStressResults(results);
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

    saveConfiguration(
      name,
      description,
      state.plies,
      engineeringProps,
      totalThickness,
      totalWeight
    );
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
              onClearPlies={clearPlies}
            />

            <SaveConfigurationDialog
              onSave={handleSaveConfiguration}
              disabled={state.plies.length === 0}
            />
          </div>

          {/* Right Panel - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={state.activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="stress">Stress Analysis</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
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

              <TabsContent value="comparison" className="mt-6">
                <ConfigurationComparison
                  configurations={configurations}
                  loading={configsLoading}
                  currentConfig={state.plies.length > 0 ? handleAddCurrentToComparison() : null}
                  onAddCurrent={() => {}}
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
