import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Layers, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Ply } from '@/types/materials';
import { calculateEngineeringProperties } from '@/utils/calculations';

interface ConfigurationGeneratorProps {
  availableMaterials: string[];
  materials: Record<string, any>;
  onApplyConfiguration: (plies: Ply[]) => void;
}

interface GeneratedConfig {
  plies: Ply[];
  thickness: number;
  weight: number;
  score: number;
}

export function ConfigurationGenerator({
  availableMaterials,
  materials,
  onApplyConfiguration,
}: ConfigurationGeneratorProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [targetThickness, setTargetThickness] = useState<number>(5);
  const [generatedConfigs, setGeneratedConfigs] = useState<GeneratedConfig[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const generateConfigurations = () => {
    if (selectedMaterials.length === 0) {
      toast.error('Please select at least one material');
      return;
    }

    setIsGenerating(true);
    
    // Generate multiple configurations with different angle combinations
    const configs: GeneratedConfig[] = [];
    const anglePatterns = [
      [0, 90, 0, 90],           // Cross-ply
      [0, 45, -45, 90],         // Quasi-isotropic
      [0, 0, 90, 90],           // Balanced
      [45, -45, 45, -45],       // Shear-optimized
      [0, 30, -30, 60, -60, 90], // Multi-angle
      [0, 45, 90, -45],         // Rotated quasi-isotropic
    ];

    selectedMaterials.forEach(material => {
      const materialData = materials[material];
      if (!materialData) return;

      const plyThickness = materialData.thickness;
      
      anglePatterns.forEach(pattern => {
        // Calculate how many times to repeat the pattern to reach target thickness
        const patternThickness = pattern.length * plyThickness;
        const repeats = Math.max(1, Math.round(targetThickness / patternThickness));
        
        // Build the ply stack
        const plies: Ply[] = [];
        for (let i = 0; i < repeats; i++) {
          pattern.forEach(angle => {
            plies.push({ material, angle });
          });
        }

        // Calculate properties
        const properties = calculateEngineeringProperties(plies, materials);
        const totalWeight = plies.reduce((sum, ply) => {
          const mat = materials[ply.material];
          return sum + (mat ? mat.density * mat.thickness : 0);
        }, 0);

        // Score based on multiple factors
        const thicknessDiff = Math.abs(properties.thickness - targetThickness);
        const strengthScore = properties.Ex / 100000; // Normalize strength
        const weightPenalty = totalWeight / 100; // Lower weight is better
        const score = strengthScore - thicknessDiff - weightPenalty;

        configs.push({
          plies,
          thickness: properties.thickness,
          weight: totalWeight,
          score,
        });
      });
    });

    // Sort by score (best first)
    configs.sort((a, b) => b.score - a.score);
    
    // Take top 6 configurations
    setGeneratedConfigs(configs.slice(0, 6));
    setIsGenerating(false);
    
    toast.success(`Generated ${configs.slice(0, 6).length} optimized configurations`);
  };

  const getBestConfig = () => generatedConfigs[0];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Configuration Generator</h3>
          </div>

          <div className="space-y-2">
            <Label>Select Materials</Label>
            <div className="flex flex-wrap gap-2">
              {availableMaterials.map(material => (
                <Badge
                  key={material}
                  variant={selectedMaterials.includes(material) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleMaterial(material)}
                >
                  {material}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-thickness">Target Thickness (mm)</Label>
            <Input
              id="target-thickness"
              type="number"
              value={targetThickness}
              onChange={(e) => setTargetThickness(Number(e.target.value))}
              min={1}
              max={50}
              step={0.5}
            />
          </div>

          <Button
            onClick={generateConfigurations}
            disabled={isGenerating || selectedMaterials.length === 0}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Configurations'}
          </Button>
        </div>
      </Card>

      {generatedConfigs.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Best Configuration</h3>
              <Badge variant="default" className="ml-auto">Score: {getBestConfig().score.toFixed(2)}</Badge>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Thickness:</span>
                <span className="font-medium">{getBestConfig().thickness.toFixed(2)} mm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Weight:</span>
                <span className="font-medium">{getBestConfig().weight.toFixed(2)} g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plies:</span>
                <span className="font-medium">{getBestConfig().plies.length}</span>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="text-sm text-muted-foreground mb-2">Ply Stack:</div>
                <div className="flex flex-wrap gap-1">
                  {getBestConfig().plies.map((ply, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {ply.angle}°
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => onApplyConfiguration(getBestConfig().plies)}
                className="w-full mt-2"
              >
                <Layers className="h-4 w-4 mr-2" />
                Apply Best Configuration
              </Button>
            </div>
          </div>
        </Card>
      )}

      {generatedConfigs.length > 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Alternative Configurations</h3>
          <div className="grid gap-3">
            {generatedConfigs.slice(1).map((config, idx) => (
              <div key={idx} className="p-3 bg-muted/30 rounded-lg flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Configuration {idx + 2}</div>
                  <div className="text-xs text-muted-foreground">
                    {config.thickness.toFixed(2)}mm · {config.weight.toFixed(2)}g · {config.plies.length} plies
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Score: {config.score.toFixed(2)}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onApplyConfiguration(config.plies)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
