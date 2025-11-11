import { Card } from '@/components/ui/card';
import { ABDMatrix } from '@/utils/abdMatrix';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Ply, Material } from '@/types/materials';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ABDMatrixDisplayProps {
  matrix: ABDMatrix;
  plies: Ply[];
  materials: Record<string, Material>;
}

export function ABDMatrixDisplay({ matrix, plies, materials }: ABDMatrixDisplayProps) {
  const totalThickness = plies.reduce((sum, ply) => {
    const material = materials[ply.material];
    return sum + (material?.thickness || 0);
  }, 0);
  
  const formatNumber = (num: number) => {
    if (Math.abs(num) < 0.001) return '0.00';
    if (Math.abs(num) >= 1000000) return num.toExponential(2);
    return num.toFixed(2);
  };

  const formatNumber3 = (num: number) => {
    if (Math.abs(num) < 0.001) return '0.00';
    if (Math.abs(num) >= 1000000) return num.toExponential(3);
    return num.toFixed(3);
  };

  const renderMatrix = (name: string, mat: number[][], unit: string) => (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground">
        {name} Matrix <span className="text-xs text-muted-foreground">({unit})</span>
      </h4>
      <div className="font-mono text-xs bg-muted/30 p-3 rounded border border-border">
        {mat.map((row, i) => (
          <div key={i} className="flex gap-2 justify-between">
            {row.map((val, j) => (
              <span key={j} className="flex-1 text-right">
                {formatNumber(val)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMatrixWithBrackets = (matrix: number[][], label: string) => (
    <div className="font-mono text-xs bg-muted/30 p-3 rounded border border-border">
      <div className="text-sm font-semibold mb-2 text-foreground">{label}</div>
      {matrix.map((row, i) => (
        <div key={i} className="flex gap-2">
          {i === 0 && <span className="text-muted-foreground">⎡</span>}
          {i > 0 && i < matrix.length - 1 && <span className="text-muted-foreground">⎢</span>}
          {i === matrix.length - 1 && <span className="text-muted-foreground">⎣</span>}
          {row.map((val, j) => (
            <span key={j} className="flex-1 text-right min-w-[80px]">
              {formatNumber3(val)}
            </span>
          ))}
          {i === 0 && <span className="text-muted-foreground">⎤</span>}
          {i > 0 && i < matrix.length - 1 && <span className="text-muted-foreground">⎥</span>}
          {i === matrix.length - 1 && <span className="text-muted-foreground">⎦</span>}
        </div>
      ))}
    </div>
  );

  const calculatePlyMatrices = (ply: Ply, material: Material, plyIndex: number) => {
    const angleRad = ply.angle * Math.PI / 180;
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    const c2 = c * c;
    const s2 = s * s;
    const c4 = c2 * c2;
    const s4 = s2 * s2;

    // Q matrix
    const E1 = material.E1;
    const E2 = material.E2;
    const nu12 = material.nu12;
    const G12 = material.G12;
    const nu21 = nu12 * E2 / E1;
    const denom = 1 - nu12 * nu21;

    const Q11 = E1 / denom;
    const Q12 = nu12 * E2 / denom;
    const Q22 = E2 / denom;
    const Q66 = G12;

    const Q = [
      [Q11, Q12, 0],
      [Q12, Q22, 0],
      [0, 0, Q66]
    ];

    // Q-bar matrix (transformed)
    const Q11_bar = Q11 * c4 + 2 * (Q12 + 2 * Q66) * s2 * c2 + Q22 * s4;
    const Q12_bar = (Q11 + Q22 - 4 * Q66) * s2 * c2 + Q12 * (s4 + c4);
    const Q16_bar = (Q11 - Q12 - 2 * Q66) * s * c2 * c + (Q12 - Q22 + 2 * Q66) * s2 * s * c;
    const Q22_bar = Q11 * s4 + 2 * (Q12 + 2 * Q66) * s2 * c2 + Q22 * c4;
    const Q26_bar = (Q11 - Q12 - 2 * Q66) * s2 * s * c + (Q12 - Q22 + 2 * Q66) * s * c2 * c;
    const Q66_bar = (Q11 + Q22 - 2 * Q12 - 2 * Q66) * s2 * c2 + Q66 * (s4 + c4);

    const Q_bar = [
      [Q11_bar, Q12_bar, Q16_bar],
      [Q12_bar, Q22_bar, Q26_bar],
      [Q16_bar, Q26_bar, Q66_bar]
    ];

    return { Q, Q_bar, material, angle: ply.angle };
  };

  const calculateABDStepByStep = () => {
    const h0 = -totalThickness / 2;
    let z = h0;

    const A: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const B: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const D: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

    const steps = plies.map((ply, index) => {
      const material = materials[ply.material];
      if (!material) return null;

      const t = material.thickness;
      const z1 = z + t;
      const { Q, Q_bar } = calculatePlyMatrices(ply, material, index);

      // Contribution to A, B, D
      const A_contrib: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      const B_contrib: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      const D_contrib: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          A_contrib[i][j] = Q_bar[i][j] * t;
          B_contrib[i][j] = 0.5 * Q_bar[i][j] * (z1 * z1 - z * z);
          D_contrib[i][j] = (1/3) * Q_bar[i][j] * (z1 * z1 * z1 - z * z * z);

          A[i][j] += A_contrib[i][j];
          B[i][j] += B_contrib[i][j];
          D[i][j] += D_contrib[i][j];
        }
      }

      const zStart = z;
      z = z1;

      return {
        plyNumber: index + 1,
        material: ply.material,
        angle: ply.angle,
        thickness: t,
        zStart,
        zEnd: z1,
        Q,
        Q_bar,
        A_contrib,
        B_contrib,
        D_contrib
      };
    }).filter(Boolean);

    return { steps };
  };

  const { steps } = calculateABDStepByStep();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Classical Lamination Theory - ABD Matrix
      </h3>
      <div className="space-y-4">
        {renderMatrix('A', matrix.A, 'N/mm')}
        {renderMatrix('B', matrix.B, 'N')}
        {renderMatrix('D', matrix.D, 'N·mm')}
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        <p>A: Extensional stiffness | B: Coupling stiffness | D: Bending stiffness</p>
      </div>

      <Separator className="my-6" />

      <div className="space-y-4">
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <h4 className="text-base font-semibold text-foreground">Classical Lamination Theory (CLT)</h4>
            <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-4 text-sm text-muted-foreground mt-4">
              <p>
                Classical Lamination Theory is used to predict the behavior of composite laminates under mechanical loads.
                The theory relates forces and moments to strains and curvatures through the ABD matrix.
              </p>
              <div className="bg-muted/30 p-4 rounded border border-border">
                <div className="font-mono text-xs">
                  <div>⎧ N ⎫   ⎡ A | B ⎤ ⎧ ε⁰ ⎫</div>
                  <div>⎨   ⎬ = ⎢ ——|—— ⎥ ⎨   ⎬</div>
                  <div>⎩ M ⎭   ⎣ B | D ⎦ ⎩ κ  ⎭</div>
                </div>
                <div className="mt-2 text-xs">
                  <p>where:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>N = resultant in-plane forces [N/mm]</li>
                    <li>M = resultant moments [N·mm/mm]</li>
                    <li>ε⁰ = mid-plane strains</li>
                    <li>κ = curvatures [1/mm]</li>
                    <li>A = extensional stiffness matrix</li>
                    <li>B = coupling stiffness matrix</li>
                    <li>D = bending stiffness matrix</li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <h4 className="text-base font-semibold text-foreground">Configuration Summary</h4>
            <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="text-sm space-y-2 mt-4">
              <p className="text-muted-foreground">Total number of plies: <span className="text-foreground font-semibold">{plies.length}</span></p>
              <p className="text-muted-foreground">Total thickness: <span className="text-foreground font-semibold">{totalThickness.toFixed(3)} mm</span></p>
              <p className="text-muted-foreground">Midplane location: <span className="text-foreground font-semibold">z = 0 mm (at {(-totalThickness/2).toFixed(3)} to {(totalThickness/2).toFixed(3)} mm)</span></p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <h4 className="text-base font-semibold text-foreground">Stress Distribution Through Thickness</h4>
            <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ScrollArea className="h-[600px] mt-4">
              <div className="space-y-6 pr-4">
                {steps.map((step, idx) => (
                  <Card key={idx} className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-foreground">
                      Ply {step.plyNumber}: {step.material} at {step.angle}°
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Thickness: <span className="text-foreground font-semibold">{step.thickness} mm</span></p>
                          <p className="text-muted-foreground">Position: <span className="text-foreground font-semibold">z = {formatNumber3(step.zStart)} to {formatNumber3(step.zEnd)} mm</span></p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2 text-foreground">Step 1: Material Stiffness Matrix (Q)</h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          The reduced stiffness matrix Q relates stresses to strains in the material coordinate system (1-2).
                        </p>
                        {renderMatrixWithBrackets(step.Q, 'Q (MPa)')}
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2 text-foreground">Step 2: Transformed Stiffness Matrix (Q̄)</h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          Transform Q to the global coordinate system (x-y) using the rotation angle θ = {step.angle}°.
                        </p>
                        {renderMatrixWithBrackets(step.Q_bar, 'Q̄ (MPa)')}
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2 text-foreground">Step 3: Contribution to ABD Matrices</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">A contribution: Aᵢⱼ = Q̄ᵢⱼ × t</p>
                            {renderMatrixWithBrackets(step.A_contrib, 'ΔA (N/mm)')}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">B contribution: Bᵢⱼ = ½ Q̄ᵢⱼ × (z₁² - z₀²)</p>
                            {renderMatrixWithBrackets(step.B_contrib, 'ΔB (N)')}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">D contribution: Dᵢⱼ = ⅓ Q̄ᵢⱼ × (z₁³ - z₀³)</p>
                            {renderMatrixWithBrackets(step.D_contrib, 'ΔD (N·mm)')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}
