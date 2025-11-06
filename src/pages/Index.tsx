import { useState, useMemo, useEffect } from 'react';
import { useMaterials } from '@/hooks/useMaterials';
import { useAppState } from '@/hooks/useAppState';
import { MaterialSelector } from '@/components/composite/MaterialSelector';
import { MaterialProperties } from '@/components/composite/MaterialProperties';
import { MaterialEditor } from '@/components/composite/MaterialEditor';
import { PlyStack } from '@/components/composite/PlyStack';
import { EngineeringProperties } from '@/components/composite/EngineeringProperties';
import { LoadInputs } from '@/components/composite/LoadInputs';
import { StressResults } from '@/components/composite/StressResults';
import { CrossSectionVisualization } from '@/components/composite/CrossSectionVisualization';
import { ABDMatrixDisplay } from '@/components/composite/ABDMatrixDisplay';
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
          </div>

          {/* Right Panel - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={state.activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="visualization">Visualization</TabsTrigger>
                <TabsTrigger value="stress">Stress Analysis</TabsTrigger>
                <TabsTrigger value="abd">ABD Matrix</TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="mt-6">
                <EngineeringProperties properties={engineeringProps} />
              </TabsContent>

              <TabsContent value="visualization" className="mt-6">
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

              <TabsContent value="abd" className="mt-6">
                <ABDMatrixDisplay matrix={abdMatrix} />
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
