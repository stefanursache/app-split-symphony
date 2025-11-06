import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StressResult } from '@/types/materials';
import { TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StressResultsProps {
  results: StressResult[];
}

export function StressResults({ results }: StressResultsProps) {
  if (results.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Stress Analysis Results</h3>
        <p className="text-muted-foreground">Click "Calculate Stress/Strain" to see results</p>
      </Card>
    );
  }

  const getStressIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-destructive" />;
    if (value < 0) return <TrendingDown className="h-3 w-3 text-primary" />;
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
  };

  const getStressColor = (value: number, limit: number) => {
    const ratio = Math.abs(value) / limit;
    if (ratio > 0.8) return 'text-destructive';
    if (ratio > 0.5) return 'text-yellow-500';
    return 'text-foreground';
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Stress/Strain Analysis Results</h3>
      
      <Tabs defaultValue="material" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="material">Material Axes</TabsTrigger>
          <TabsTrigger value="global">Global Axes</TabsTrigger>
          <TabsTrigger value="principal">Principal</TabsTrigger>
          <TabsTrigger value="strain">Strains</TabsTrigger>
        </TabsList>

        <TabsContent value="material" className="mt-4 space-y-4">
          {results.map((result, index) => (
            <div key={index} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-foreground">
                  Ply {result.ply}: {result.material} @ {result.angle}°
                </div>
                <Badge variant="outline" className="text-xs">
                  Material Coordinates
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">σ₁ (Longitudinal)</div>
                  <div className="font-mono font-medium flex items-center gap-1">
                    {getStressIcon(result.sigma_1)}
                    <span className={getStressColor(result.sigma_1, 1000)}>
                      {result.sigma_1.toFixed(2)} MPa
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">σ₂ (Transverse)</div>
                  <div className="font-mono font-medium flex items-center gap-1">
                    {getStressIcon(result.sigma_2)}
                    <span className={getStressColor(result.sigma_2, 1000)}>
                      {result.sigma_2.toFixed(2)} MPa
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">τ₁₂ (Shear)</div>
                  <div className="font-mono font-medium">
                    {result.tau_12.toFixed(2)} MPa
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="global" className="mt-4 space-y-4">
          {results.map((result, index) => (
            <div key={index} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-foreground">
                  Ply {result.ply}: {result.material} @ {result.angle}°
                </div>
                <Badge variant="outline" className="text-xs">
                  Global Coordinates
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">σₓ (Axial)</div>
                  <div className="font-mono font-medium flex items-center gap-1">
                    {getStressIcon(result.sigma_x)}
                    {result.sigma_x.toFixed(2)} MPa
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">σᵧ (Hoop)</div>
                  <div className="font-mono font-medium flex items-center gap-1">
                    {getStressIcon(result.sigma_y)}
                    {result.sigma_y.toFixed(2)} MPa
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">τₓᵧ (Shear)</div>
                  <div className="font-mono font-medium">
                    {result.tau_xy.toFixed(2)} MPa
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="principal" className="mt-4 space-y-4">
          {results.map((result, index) => (
            <div key={index} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-foreground">
                  Ply {result.ply}: {result.material} @ {result.angle}°
                </div>
                <Badge variant="outline" className="text-xs">
                  Principal Stresses
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">σ₁ (Max Principal)</div>
                  <div className="font-mono font-medium flex items-center gap-1">
                    {getStressIcon(result.sigma_principal_max)}
                    <span className={getStressColor(result.sigma_principal_max, 1000)}>
                      {result.sigma_principal_max.toFixed(2)} MPa
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">σ₂ (Min Principal)</div>
                  <div className="font-mono font-medium flex items-center gap-1">
                    {getStressIcon(result.sigma_principal_min)}
                    <span className={getStressColor(result.sigma_principal_min, 1000)}>
                      {result.sigma_principal_min.toFixed(2)} MPa
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">τₘₐₓ (Max Shear)</div>
                  <div className="font-mono font-medium">
                    {result.tau_max.toFixed(2)} MPa
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">σᵥₘ (von Mises)</div>
                  <div className="font-mono font-medium text-cyan-400">
                    {result.von_mises.toFixed(2)} MPa
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="strain" className="mt-4 space-y-4">
          {results.map((result, index) => (
            <div key={index} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-foreground">
                  Ply {result.ply}: {result.material} @ {result.angle}°
                </div>
                <Badge variant="outline" className="text-xs">
                  Material Strains
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">ε₁ (Longitudinal)</div>
                  <div className="font-mono font-medium flex items-center gap-1">
                    {getStressIcon(result.epsilon_1)}
                    {(result.epsilon_1 * 1000000).toFixed(0)} με
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">ε₂ (Transverse)</div>
                  <div className="font-mono font-medium flex items-center gap-1">
                    {getStressIcon(result.epsilon_2)}
                    {(result.epsilon_2 * 1000000).toFixed(0)} με
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">γ₁₂ (Shear)</div>
                  <div className="font-mono font-medium">
                    {(result.gamma_12 * 1000000).toFixed(0)} με
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  Note: με = microstrain (10⁻⁶)
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
