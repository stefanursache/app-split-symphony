import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface AdvancedAnalysisOptionsProps {
  enableThermalAnalysis: boolean;
  enableBucklingAnalysis: boolean;
  deltaT: number;
  onThermalToggle: (enabled: boolean) => void;
  onBucklingToggle: (enabled: boolean) => void;
  onDeltaTChange: (value: number) => void;
}

export function AdvancedAnalysisOptions({
  enableThermalAnalysis,
  enableBucklingAnalysis,
  deltaT,
  onThermalToggle,
  onBucklingToggle,
  onDeltaTChange,
}: AdvancedAnalysisOptionsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Advanced Analysis Options
      </h3>

      <div className="space-y-6">
        {/* Thermal Analysis */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="thermalAnalysis"
              checked={enableThermalAnalysis}
              onCheckedChange={(checked) => onThermalToggle(checked as boolean)}
            />
            <Label htmlFor="thermalAnalysis" className="cursor-pointer">
              Enable Thermal Stress Analysis (Optional)
            </Label>
          </div>
          
          {enableThermalAnalysis && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="deltaT">Temperature Change (ΔT, °C):</Label>
              <Input
                id="deltaT"
                type="number"
                step="1"
                value={deltaT}
                onChange={(e) => onDeltaTChange(Number(e.target.value))}
                className="max-w-xs"
              />
              <p className="text-sm text-muted-foreground">
                Temperature change from cure/stress-free temperature
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Buckling Analysis */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bucklingAnalysis"
              checked={enableBucklingAnalysis}
              onCheckedChange={(checked) => onBucklingToggle(checked as boolean)}
            />
            <Label htmlFor="bucklingAnalysis" className="cursor-pointer">
              Enable Buckling Analysis (Optional)
            </Label>
          </div>
          
          {enableBucklingAnalysis && (
            <div className="ml-6">
              <p className="text-sm text-muted-foreground">
                Calculates critical buckling loads for compression. Requires compression loading (Nx &lt; 0 or Ny &lt; 0).
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Default Analyses */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">
            Default Analyses (Always Enabled):
          </h4>
          <ul className="ml-6 space-y-1 text-sm text-muted-foreground list-disc">
            <li>Progressive Failure Analysis - Tracks ply-by-ply degradation</li>
            <li>Interlaminar Stress Analysis - Assesses delamination risk</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
