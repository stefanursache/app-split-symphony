import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Thermometer } from 'lucide-react';
import { ThermalStressResult } from '@/utils/thermalAnalysis';

interface ThermalStressResultsProps {
  results: ThermalStressResult[];
  deltaT: number;
}

export function ThermalStressResults({ results, deltaT }: ThermalStressResultsProps) {
  if (results.length === 0) {
    return null;
  }

  const maxThermalStress = Math.max(
    ...results.map(r => Math.max(Math.abs(r.sigma_1_thermal), Math.abs(r.sigma_2_thermal)))
  );

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Thermometer className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Thermal Stress Analysis
        </h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Temperature Change:</p>
            <p className="text-lg font-semibold text-foreground">{deltaT.toFixed(1)} °C</p>
          </div>
          <div>
            <p className="text-muted-foreground">Max Thermal Stress:</p>
            <p className="text-lg font-semibold text-foreground">
              {maxThermalStress.toFixed(2)} MPa
            </p>
          </div>
        </div>

        {maxThermalStress > 50 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              High thermal stresses detected. Consider thermal expansion mismatch between plies.
            </AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-foreground">Ply</th>
                <th className="text-left py-2 px-2 text-foreground">Material</th>
                <th className="text-right py-2 px-2 text-foreground">Angle</th>
                <th className="text-right py-2 px-2 text-foreground">σ₁ (MPa)</th>
                <th className="text-right py-2 px-2 text-foreground">σ₂ (MPa)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.ply} className="border-b border-border/50">
                  <td className="py-2 px-2 text-foreground">{result.ply}</td>
                  <td className="py-2 px-2 text-muted-foreground">{result.material}</td>
                  <td className="text-right py-2 px-2 text-muted-foreground">
                    {result.angle}°
                  </td>
                  <td className="text-right py-2 px-2 text-foreground font-mono">
                    {result.sigma_1_thermal.toFixed(2)}
                  </td>
                  <td className="text-right py-2 px-2 text-foreground font-mono">
                    {result.sigma_2_thermal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
