import { Card } from '@/components/ui/card';
import { ABDMatrix } from '@/utils/abdMatrix';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Ply, Material } from '@/types/materials';

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
            <h4 className="text-base font-semibold text-foreground">Final ABD Matrix</h4>
            <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="text-sm text-muted-foreground mb-4 mt-4">
              Sum of all ply contributions to obtain the complete laminate stiffness matrices.
            </p>
            <div className="space-y-4">
              {renderMatrix('A - Extensional Stiffness', matrix.A, 'N/mm')}
              {renderMatrix('B - Coupling Stiffness', matrix.B, 'N')}
              {renderMatrix('D - Bending Stiffness', matrix.D, 'N·mm')}
            </div>
            
            <div className="mt-6 p-4 bg-muted/30 rounded border border-border">
              <h5 className="font-semibold mb-2 text-foreground">Interpretation</h5>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                <li><strong>A matrix:</strong> Controls in-plane response. Diagonal terms are extensional stiffnesses in x, y, and shear.</li>
                <li><strong>B matrix:</strong> Represents bending-extension coupling. Zero for symmetric laminates.</li>
                <li><strong>D matrix:</strong> Controls bending and twisting response. Analogous to moment of inertia.</li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}
