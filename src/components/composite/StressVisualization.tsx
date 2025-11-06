import { Card } from '@/components/ui/card';
import { Ply, Material } from '@/types/materials';
import { useMemo } from 'react';

interface StressVisualizationProps {
  plies: Ply[];
  materials: Record<string, Material>;
  stressResults: any[];
}

export function StressVisualization({ plies, materials, stressResults }: StressVisualizationProps) {
  const getStressColor = (stress: number, maxStress: number) => {
    const ratio = Math.abs(stress) / maxStress;
    if (ratio < 0.3) return 'hsl(120, 70%, 50%)'; // Green - safe
    if (ratio < 0.6) return 'hsl(60, 70%, 50%)'; // Yellow - moderate
    if (ratio < 0.8) return 'hsl(30, 70%, 50%)'; // Orange - high
    return 'hsl(0, 70%, 50%)'; // Red - critical
  };

  const visualizationData = useMemo(() => {
    if (!stressResults.length) return null;

    const totalThickness = plies.reduce((sum, ply) => {
      const material = materials[ply.material];
      return sum + (material?.thickness || 0);
    }, 0);

    let z = -totalThickness / 2;
    const maxStress = Math.max(...stressResults.map(r => 
      Math.max(
        Math.abs(r.sigma_1_bottom || 0),
        Math.abs(r.sigma_1_top || 0),
        Math.abs(r.sigma_2_bottom || 0),
        Math.abs(r.sigma_2_top || 0),
        Math.abs(r.tau_12_bottom || 0),
        Math.abs(r.tau_12_top || 0)
      )
    ));

    return plies.map((ply, idx) => {
      const material = materials[ply.material];
      const thickness = material?.thickness || 0;
      const result = stressResults[idx];
      
      const zStart = z;
      const zEnd = z + thickness;
      z = zEnd;

      // Use maximum stresses from top and bottom
      const sigma_1 = Math.max(Math.abs(result?.sigma_1_bottom || 0), Math.abs(result?.sigma_1_top || 0));
      const sigma_2 = Math.max(Math.abs(result?.sigma_2_bottom || 0), Math.abs(result?.sigma_2_top || 0));
      const tau_12 = Math.max(Math.abs(result?.tau_12_bottom || 0), Math.abs(result?.tau_12_top || 0));

      return {
        plyNumber: idx + 1,
        material: ply.material,
        angle: ply.angle,
        zStart,
        zEnd,
        thickness,
        sigma_1,
        sigma_2,
        tau_12,
        maxStress,
        vonMises: result?.von_mises || 0
      };
    });
  }, [plies, materials, stressResults]);

  if (!visualizationData) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Stress Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Run stress analysis to visualize stress distribution through the laminate thickness.
        </p>
      </Card>
    );
  }

  const maxThickness = visualizationData[visualizationData.length - 1].zEnd - visualizationData[0].zStart;
  const scale = 400 / maxThickness; // Scale factor for visualization

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Stress Distribution Through Thickness</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Visual representation */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Cross-Section View</h4>
          <div className="relative bg-muted/30 rounded border border-border p-4">
            <svg width="100%" height="450" viewBox="0 0 300 450">
              {/* Z-axis */}
              <line x1="30" y1="25" x2="30" y2="425" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              <text x="10" y="30" fontSize="10" fill="currentColor">z</text>
              
              {/* Plies */}
              {visualizationData.map((ply, idx) => {
                const yStart = 225 - (ply.zStart * scale);
                const yEnd = 225 - (ply.zEnd * scale);
                const height = Math.abs(yEnd - yStart);
                
                return (
                  <g key={idx}>
                    {/* Ply rectangle with stress coloring */}
                    <rect
                      x="50"
                      y={Math.min(yStart, yEnd)}
                      width="200"
                      height={height}
                      fill={getStressColor(ply.vonMises, ply.maxStress)}
                      stroke="currentColor"
                      strokeWidth="1"
                      opacity="0.7"
                    />
                    
                    {/* Ply label */}
                    <text
                      x="60"
                      y={Math.min(yStart, yEnd) + height / 2 + 4}
                      fontSize="10"
                      fill="currentColor"
                      fontWeight="600"
                    >
                      Ply {ply.plyNumber} ({ply.angle}°)
                    </text>
                    
                    {/* Z coordinates */}
                    <text x="10" y={yStart + 4} fontSize="9" fill="currentColor" opacity="0.7">
                      {ply.zStart.toFixed(2)}
                    </text>
                  </g>
                );
              })}
              
              {/* Final z coordinate */}
              <text 
                x="10" 
                y={225 - (visualizationData[visualizationData.length - 1].zEnd * scale) + 4} 
                fontSize="9" 
                fill="currentColor" 
                opacity="0.7"
              >
                {visualizationData[visualizationData.length - 1].zEnd.toFixed(2)}
              </text>
            </svg>
          </div>
          
          {/* Legend */}
          <div className="mt-4 space-y-2">
            <h5 className="text-xs font-semibold text-foreground">Stress Level</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(120, 70%, 50%)' }} />
                <span className="text-muted-foreground">Safe (&lt;30%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(60, 70%, 50%)' }} />
                <span className="text-muted-foreground">Moderate (30-60%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(30, 70%, 50%)' }} />
                <span className="text-muted-foreground">High (60-80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(0, 70%, 50%)' }} />
                <span className="text-muted-foreground">Critical (&gt;80%)</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stress values table */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Max Stress Components (MPa)</h4>
          <div className="space-y-3">
            {visualizationData.map((ply) => (
              <div key={ply.plyNumber} className="p-3 rounded border border-border bg-muted/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm text-foreground">
                    Ply {ply.plyNumber} - {ply.material}
                  </span>
                  <span className="text-xs text-muted-foreground">{ply.angle}°</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Max |σ₁|:</span>
                    <span className="ml-1 font-mono text-foreground">{ply.sigma_1.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max |σ₂|:</span>
                    <span className="ml-1 font-mono text-foreground">{ply.sigma_2.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max |τ₁₂|:</span>
                    <span className="ml-1 font-mono text-foreground">{ply.tau_12.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">von Mises:</span>
                    <span className="ml-1 font-mono text-foreground">{ply.vonMises.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
