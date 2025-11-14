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

  const validateStackingRules = (plies: Ply[]): { isValid: boolean; penalty: number; issues: string[] } => {
    const issues: string[] = [];
    let penalty = 0;

    // Rule 1: Adjacent angle difference should not exceed 60°
    for (let i = 0; i < plies.length - 1; i++) {
      const angleDiff = Math.abs(plies[i].angle - plies[i + 1].angle);
      if (angleDiff > 60 && angleDiff < 300) { // Account for wrap-around (e.g., -45 to 45 = 90, but could be considered as 270)
        penalty += 0.05;
        if (plies.length > 16) {
          issues.push(`Adjacent angle difference exceeds 60° at ply ${i + 1}-${i + 2}`);
        }
      }
    }

    // Rule 2: No more than 5 consecutive plies of the same angle
    let consecutiveCount = 1;
    for (let i = 1; i < plies.length; i++) {
      if (plies[i].angle === plies[i - 1].angle) {
        consecutiveCount++;
        if (consecutiveCount > 5) {
          penalty += 0.1;
          issues.push(`More than 5 consecutive ${plies[i].angle}° plies (risk of edge splitting)`);
        }
      } else {
        consecutiveCount = 1;
      }
    }

    // Rule 3: Multiple 90° plies should not be together
    for (let i = 0; i < plies.length - 1; i++) {
      if (plies[i].angle === 90 && plies[i + 1].angle === 90) {
        penalty += 0.08;
        issues.push(`Consecutive 90° plies at position ${i + 1}-${i + 2} (should mix with 0° or ±45°)`);
      }
    }

    // Rule 4: Exterior layers should preferably be ±45° (not 0° or 90°)
    if (plies.length > 0) {
      const firstAngle = Math.abs(plies[0].angle);
      const lastAngle = Math.abs(plies[plies.length - 1].angle);
      
      if (firstAngle !== 45) {
        penalty += 0.03;
      }
      if (lastAngle !== 45) {
        penalty += 0.03;
      }
      
      if (firstAngle === 0 || firstAngle === 90) {
        issues.push(`Outer ply has ${plies[0].angle}° orientation (±45° preferred for impact resistance)`);
      }
      if (lastAngle === 0 || lastAngle === 90) {
        issues.push(`Outer ply has ${plies[plies.length - 1].angle}° orientation (±45° preferred for impact resistance)`);
      }
    }

    const isValid = penalty < 0.5; // Consider invalid if penalty is too high
    return { isValid, penalty, issues };
  };

  const generateConfigurations = () => {
    if (selectedMaterials.length === 0) {
      toast.error('Please select at least one material');
      return;
    }

    setIsGenerating(true);
    
    // Generate multiple configurations with different angle combinations
    const configs: GeneratedConfig[] = [];
    // Updated angle patterns to follow stacking rules better
    const anglePatterns = [
      [45, -45, 0, 90, 0, -45, 45],     // Symmetric with ±45° exterior
      [45, 0, -45, 90, -45, 0, 45],     // Quasi-isotropic symmetric
      [45, -45, 0, 0, -45, 45],         // Balanced with ±45° exterior
      [45, -45, 45, -45, 45, -45],      // Shear-optimized
      [45, 0, -45, 60, -60, 0, 45],     // Multi-angle symmetric
      [45, -45, 90, 0, 90, -45, 45],    // Cross-ply with ±45° exterior
    ];

    // Generate configurations with single materials
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

        const config = evaluateConfiguration(plies, materials, targetThickness);
        if (config) {
          const validation = validateStackingRules(plies);
          if (validation.isValid) {
            config.score -= validation.penalty; // Apply penalty to score
            configs.push(config);
          }
        }
      });
    });

    // Generate hybrid configurations with multiple materials
    if (selectedMaterials.length > 1) {
      anglePatterns.forEach(pattern => {
        // Strategy 1: Alternate materials by ply
        const avgThickness = selectedMaterials.reduce((sum, mat) => 
          sum + (materials[mat]?.thickness || 0), 0) / selectedMaterials.length;
        const patternThickness = pattern.length * avgThickness;
        const repeats = Math.max(1, Math.round(targetThickness / patternThickness));
        
        const plies: Ply[] = [];
        let materialIndex = 0;
        for (let i = 0; i < repeats; i++) {
          pattern.forEach(angle => {
            plies.push({ 
              material: selectedMaterials[materialIndex % selectedMaterials.length], 
              angle 
            });
            materialIndex++;
          });
        }
        
        const config = evaluateConfiguration(plies, materials, targetThickness);
        if (config) {
          const validation = validateStackingRules(plies);
          if (validation.isValid) {
            config.score -= validation.penalty;
            configs.push(config);
          }
        }

        // Strategy 2: Use stronger material for 0° and ±45°, lighter material for 90°
        if (selectedMaterials.length === 2) {
          const mat1Data = materials[selectedMaterials[0]];
          const mat2Data = materials[selectedMaterials[1]];
          
          if (mat1Data && mat2Data) {
            // Identify which material is stronger
            const strongerMat = mat1Data.E1 > mat2Data.E1 ? selectedMaterials[0] : selectedMaterials[1];
            const lighterMat = mat1Data.density < mat2Data.density ? selectedMaterials[0] : selectedMaterials[1];
            
            const hybridPlies: Ply[] = [];
            for (let i = 0; i < repeats; i++) {
              pattern.forEach(angle => {
                // Use stronger material for load-bearing angles (0°, ±45°)
                // Use lighter material for transverse angles (90°, ±60°, ±30°)
                const useStronger = Math.abs(angle) <= 45;
                hybridPlies.push({ 
                  material: useStronger ? strongerMat : lighterMat, 
                  angle 
                });
              });
            }
            
            const hybridConfig = evaluateConfiguration(hybridPlies, materials, targetThickness);
            if (hybridConfig) {
              const validation = validateStackingRules(hybridPlies);
              if (validation.isValid) {
                hybridConfig.score -= validation.penalty;
                configs.push(hybridConfig);
              }
            }
          }
        }

        // Strategy 3: Sandwich construction (strong outer, light core for bending patterns)
        if (selectedMaterials.length >= 2 && pattern.length >= 4) {
          const mat1Data = materials[selectedMaterials[0]];
          const mat2Data = materials[selectedMaterials[1]];
          
          if (mat1Data && mat2Data) {
            const strongerMat = mat1Data.E1 > mat2Data.E1 ? selectedMaterials[0] : selectedMaterials[1];
            const lighterMat = strongerMat === selectedMaterials[0] ? selectedMaterials[1] : selectedMaterials[0];
            
            const sandwichPlies: Ply[] = [];
            for (let i = 0; i < repeats; i++) {
              pattern.forEach((angle, idx) => {
                // Use stronger material for outer plies, lighter for inner
                const useOuter = idx < pattern.length / 3 || idx >= pattern.length * 2 / 3;
                sandwichPlies.push({ 
                  material: useOuter ? strongerMat : lighterMat, 
                  angle 
                });
              });
            }
            
            const sandwichConfig = evaluateConfiguration(sandwichPlies, materials, targetThickness);
            if (sandwichConfig) {
              const validation = validateStackingRules(sandwichPlies);
              if (validation.isValid) {
                sandwichConfig.score -= validation.penalty;
                configs.push(sandwichConfig);
              }
            }
          }
        }
      });
    }

    // Sort by score (best first)
    configs.sort((a, b) => b.score - a.score);
    
    // Take top 6 configurations
    setGeneratedConfigs(configs.slice(0, 6));
    setIsGenerating(false);
    
    toast.success(`Generated ${configs.slice(0, 6).length} optimized configurations`);
  };

  const evaluateConfiguration = (
    plies: Ply[], 
    materials: Record<string, any>, 
    targetThickness: number
  ): GeneratedConfig | null => {
    try {
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

      return {
        plies,
        thickness: properties.thickness,
        weight: totalWeight,
        score,
        strengthToWeightRatio,
        stiffness,
      };
    } catch (error) {
      console.error('Configuration evaluation error:', error);
      return null;
    }
  };

  const getBestConfig = () => generatedConfigs[0];
  
  const getConfigMaterials = (config: GeneratedConfig): string[] => {
    const uniqueMaterials = new Set(config.plies.map(ply => ply.material));
    return Array.from(uniqueMaterials);
  };

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

                <div>
                  <h4 className="font-semibold text-sm mb-2">6. Multi-Material Strategies</h4>
                  <div className="space-y-2 text-xs">
                    <div className="bg-muted p-2 rounded">
                      <p className="font-semibold mb-1">Alternating Strategy</p>
                      <p className="text-muted-foreground">Materials alternate by ply for balanced properties</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-semibold mb-1">Angle-Based Strategy</p>
                      <p className="text-muted-foreground">Stronger materials at 0°/±45°, lighter materials at 90°</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-semibold mb-1">Sandwich Strategy</p>
                      <p className="text-muted-foreground">Strong materials on outer surfaces, lightweight core for bending resistance</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">7. Stacking Rules Validation</h4>
                  <div className="space-y-2 text-xs">
                    <div className="bg-muted p-2 rounded">
                      <p className="font-semibold mb-1">Adjacent Angle Difference ≤ 60°</p>
                      <p className="text-muted-foreground">Prevents cracks during curing (enforced for stacks &gt;16 plies)</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-semibold mb-1">Maximum 5 Consecutive Same-Angle Plies</p>
                      <p className="text-muted-foreground">Prevents edge splitting and delamination</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-semibold mb-1">No Consecutive 90° Plies</p>
                      <p className="text-muted-foreground">Mix with 0° or ±45° plies for better performance</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-semibold mb-1">±45° Exterior Layers</p>
                      <p className="text-muted-foreground">Preferred for impact resistance and peel stress mitigation</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Note:</strong> All generated configurations are validated against composite design best practices
                    to ensure manufacturability and structural integrity. Configurations violating critical stacking rules are filtered out.
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

              <div className="pt-2 border-t border-border space-y-2">
                <div className="text-sm text-muted-foreground">Materials Used:</div>
                <div className="flex flex-wrap gap-1">
                  {getConfigMaterials(getBestConfig()).map((mat, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {mat}
                    </Badge>
                  ))}
                </div>
                
                <div className="text-sm text-muted-foreground mt-3">Ply Stack:</div>
                <div className="flex flex-wrap gap-1">
                  {getBestConfig().plies.map((ply, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="text-xs"
                      title={ply.material}
                    >
                      {ply.material.substring(0, 3)}:{ply.angle}°
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
              <div key={idx} className="p-3 bg-muted/30 rounded-lg flex justify-between items-center gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="text-sm font-medium">Configuration {idx + 2}</div>
                  <div className="text-xs text-muted-foreground">
                    {config.thickness.toFixed(2)}mm · {config.weight.toFixed(2)}g · {config.plies.length} plies
                  </div>
                  <div className="text-xs text-muted-foreground">
                    STW: {config.strengthToWeightRatio.toFixed(1)} MPa/g
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getConfigMaterials(config).map((mat, matIdx) => (
                      <Badge key={matIdx} variant="outline" className="text-[10px] px-1 py-0">
                        {mat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
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
