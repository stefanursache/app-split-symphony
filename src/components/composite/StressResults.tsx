import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StressResult } from '@/types/materials';
import { TrendingUp, TrendingDown, ArrowUpDown, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
          <TabsTrigger value="material">
            <span className="flex items-center gap-1">
              Material Axes
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Material axes (1-2): Aligned with fiber direction. σ₁ is along the fibers (longitudinal), σ₂ is perpendicular to fibers (transverse), τ₁₂ is in-plane shear.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </TabsTrigger>
          <TabsTrigger value="global">
            <span className="flex items-center gap-1">
              Global Axes
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Global axes (x-y): Fixed coordinate system for the laminate. σₓ is axial stress, σᵧ is hoop/transverse stress, τₓᵧ is in-plane shear.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </TabsTrigger>
          <TabsTrigger value="principal">
            <span className="flex items-center gap-1">
              Principal
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Principal stresses: Maximum and minimum normal stresses at oriented planes where shear stress is zero. Shows critical stress state.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </TabsTrigger>
          <TabsTrigger value="strain">
            <span className="flex items-center gap-1">
              Strains
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Material strains: Deformations in material coordinates. ε₁ and ε₂ are normal strains, γ₁₂ is shear strain (in microstrain, με).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="material" className="mt-4 space-y-4">
          {results.map((result, index) => {
            // Use maximum absolute values from top and bottom
            const maxSigma1 = Math.max(Math.abs(result.sigma_1_bottom), Math.abs(result.sigma_1_top));
            const maxSigma2 = Math.max(Math.abs(result.sigma_2_bottom), Math.abs(result.sigma_2_top));
            const maxTau12 = Math.max(Math.abs(result.tau_12_bottom), Math.abs(result.tau_12_top));
            
            return (
              <div key={index} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium text-foreground">
                    Ply {result.ply}: {result.material} @ {result.angle}°
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Material Coordinates (z: {result.z_bottom.toFixed(2)} to {result.z_top.toFixed(2)} mm)
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground">Bottom Surface:</div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">σ₁ (Longitudinal)</div>
                      <div className="font-mono font-medium flex items-center gap-1">
                        {getStressIcon(result.sigma_1_bottom)}
                        <span className={getStressColor(result.sigma_1_bottom, 1000)}>
                          {result.sigma_1_bottom.toFixed(2)} MPa
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">σ₂ (Transverse)</div>
                      <div className="font-mono font-medium flex items-center gap-1">
                        {getStressIcon(result.sigma_2_bottom)}
                        <span className={getStressColor(result.sigma_2_bottom, 1000)}>
                          {result.sigma_2_bottom.toFixed(2)} MPa
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">τ₁₂ (Shear)</div>
                      <div className="font-mono font-medium">
                        {result.tau_12_bottom.toFixed(2)} MPa
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground pt-2">Top Surface:</div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">σ₁ (Longitudinal)</div>
                      <div className="font-mono font-medium flex items-center gap-1">
                        {getStressIcon(result.sigma_1_top)}
                        <span className={getStressColor(result.sigma_1_top, 1000)}>
                          {result.sigma_1_top.toFixed(2)} MPa
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">σ₂ (Transverse)</div>
                      <div className="font-mono font-medium flex items-center gap-1">
                        {getStressIcon(result.sigma_2_top)}
                        <span className={getStressColor(result.sigma_2_top, 1000)}>
                          {result.sigma_2_top.toFixed(2)} MPa
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">τ₁₂ (Shear)</div>
                      <div className="font-mono font-medium">
                        {result.tau_12_top.toFixed(2)} MPa
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="global" className="mt-4 space-y-4">
          {results.map((result, index) => (
            <div key={index} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-foreground">
                  Ply {result.ply}: {result.material} @ {result.angle}°
                </div>
                <Badge variant="outline" className="text-xs">
                  Global Coordinates (Mid-plane)
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
                  Principal Stresses (Maximum)
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
              <div className="space-y-3">
                <div className="text-xs font-semibold text-muted-foreground">Bottom Surface:</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">ε₁ (Longitudinal)</div>
                    <div className="font-mono font-medium flex items-center gap-1">
                      {getStressIcon(result.epsilon_1_bottom)}
                      {(result.epsilon_1_bottom * 1000000).toFixed(0)} με
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">ε₂ (Transverse)</div>
                    <div className="font-mono font-medium flex items-center gap-1">
                      {getStressIcon(result.epsilon_2_bottom)}
                      {(result.epsilon_2_bottom * 1000000).toFixed(0)} με
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">γ₁₂ (Shear)</div>
                    <div className="font-mono font-medium">
                      {(result.gamma_12_bottom * 1000000).toFixed(0)} με
                    </div>
                  </div>
                </div>
                <div className="text-xs font-semibold text-muted-foreground pt-2">Top Surface:</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">ε₁ (Longitudinal)</div>
                    <div className="font-mono font-medium flex items-center gap-1">
                      {getStressIcon(result.epsilon_1_top)}
                      {(result.epsilon_1_top * 1000000).toFixed(0)} με
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">ε₂ (Transverse)</div>
                    <div className="font-mono font-medium flex items-center gap-1">
                      {getStressIcon(result.epsilon_2_top)}
                      {(result.epsilon_2_top * 1000000).toFixed(0)} με
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">γ₁₂ (Shear)</div>
                    <div className="font-mono font-medium">
                      {(result.gamma_12_top * 1000000).toFixed(0)} με
                    </div>
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
