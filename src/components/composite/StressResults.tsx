import { Card } from '@/components/ui/card';
import { StressResult } from '@/types/materials';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StressResultsProps {
  results: StressResult[];
}

export function StressResults({ results }: StressResultsProps) {
  if (results.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Stress Analysis Results</h3>
        <p className="text-muted-foreground">Click "Calculate Stress/Strain" to see results</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Stress Analysis Results</h3>
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="p-4 rounded-lg border border-border bg-card">
            <div className="font-medium mb-3 text-foreground">
              Ply {result.ply}: {result.material} @ {result.angle}°
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">σ₁</div>
                <div className="font-mono font-medium flex items-center gap-1">
                  {result.sigma_1 > 0 ? (
                    <TrendingUp className="h-3 w-3 text-destructive" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-primary" />
                  )}
                  {result.sigma_1.toFixed(2)} MPa
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">σ₂</div>
                <div className="font-mono font-medium flex items-center gap-1">
                  {result.sigma_2 > 0 ? (
                    <TrendingUp className="h-3 w-3 text-destructive" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-primary" />
                  )}
                  {result.sigma_2.toFixed(2)} MPa
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">τ₁₂</div>
                <div className="font-mono font-medium">
                  {result.tau_12.toFixed(2)} MPa
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
