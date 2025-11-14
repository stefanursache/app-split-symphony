import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Layers, CheckCircle2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Ply } from '@/types/materials';
import { calculateEngineeringProperties } from '@/utils/calculations';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
  strengthToWeightRatio: number;
  stiffness: number;
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

        // Calculate comprehensive metrics
        const thicknessDiff = Math.abs(properties.thickness - targetThickness);
        const thicknessPenalty = thicknessDiff / targetThickness; // Normalized thickness error
        
        // Strength-to-weight ratio (higher is better)
        const strengthToWeightRatio = totalWeight > 0 ? properties.Ex / totalWeight : 0;
        
        // Stiffness metric (combination of Ex and Ey)
        const stiffness = (properties.Ex + properties.Ey) / 2;
        
        // Multi-objective score:
        // 1. Maximize strength-to-weight ratio (70% weight)
        // 2. Minimize thickness deviation (20% weight)
        // 3. Maximize absolute stiffness (10% weight)
        const normalizedStrengthToWeight = strengthToWeightRatio / 10000; // Normalize to ~0-1 range
        const normalizedStiffness = stiffness / 100000; // Normalize to ~0-1 range
        
        const score = (
          (normalizedStrengthToWeight * 0.7) - 
          (thicknessPenalty * 0.2) + 
          (normalizedStiffness * 0.1)
        );

        configs.push({
          plies,
          thickness: properties.thickness,
          weight: totalWeight,
          score,
          strengthToWeightRatio,
          stiffness,
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
            <h3 className="text-lg font-semibold">Multi-Objective Configuration Generator</h3>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Generate optimized laminate configurations that maximize strength-to-weight ratio while meeting thickness requirements.
          </p>

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

      {/* Optimization Formulas Section */}
      <Card className="p-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="formulas" className="border-none">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Optimization Methodology & Formulas</h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm mb-2">1. Strength-to-Weight Ratio</h4>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    STW = E<sub>x</sub> / W<sub>total</sub>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Where E<sub>x</sub> is the longitudinal modulus (MPa) and W<sub>total</sub> is the total laminate weight (g).
                    Higher values indicate better structural efficiency.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">2. Thickness Deviation Penalty</h4>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    P<sub>thickness</sub> = |t<sub>actual</sub> - t<sub>target</sub>| / t<sub>target</sub>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Normalized thickness error ensures configurations meet the specified thickness requirement.
                    Lower values are better.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">3. Stiffness Metric</h4>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    S = (E<sub>x</sub> + E<sub>y</sub>) / 2
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Average of longitudinal and transverse moduli, representing overall structural rigidity.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">4. Multi-Objective Score</h4>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm mb-2">
                    Score = (0.7 × STW<sub>norm</sub>) - (0.2 × P<sub>thickness</sub>) + (0.1 × S<sub>norm</sub>)
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>• 70% weight: Strength-to-weight ratio (primary objective)</p>
                    <p>• 20% weight: Thickness deviation penalty</p>
                    <p>• 10% weight: Absolute stiffness</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    The configuration with the highest score represents the optimal balance between being lightweight and strong.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">5. Layup Patterns Evaluated</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted p-2 rounded">
                      <p className="font-semibold">[0/90]<sub>n</sub> - Cross-ply</p>
                      <p className="text-muted-foreground">Balanced orthotropic</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-semibold">[0/45/-45/90]<sub>n</sub> - Quasi-isotropic</p>
                      <p className="text-muted-foreground">Near-isotropic properties</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-semibold">[0/0/90/90]<sub>n</sub> - Balanced</p>
                      <p className="text-muted-foreground">Symmetric stacking</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-semibold">[45/-45]<sub>n</sub> - Shear</p>
                      <p className="text-muted-foreground">Shear-optimized</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-semibold">[0/30/-30/60/-60/90]<sub>n</sub></p>
                      <p className="text-muted-foreground">Multi-angle</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-semibold">[0/45/90/-45]<sub>n</sub></p>
                      <p className="text-muted-foreground">Rotated quasi-iso</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Note:</strong> The generator creates multiple variants of each pattern using your selected materials,
                    repeating the pattern to approximate the target thickness, then ranks all configurations by the multi-objective score.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">STW Ratio:</span>
                <span className="font-medium">{getBestConfig().strengthToWeightRatio.toFixed(1)} MPa/g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stiffness:</span>
                <span className="font-medium">{(getBestConfig().stiffness / 1000).toFixed(1)} GPa</span>
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
                  <div className="text-xs text-muted-foreground">
                    STW: {config.strengthToWeightRatio.toFixed(1)} MPa/g
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
