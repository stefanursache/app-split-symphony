import { Card } from '@/components/ui/card';
import { ABDMatrix } from '@/utils/abdMatrix';

interface ABDMatrixDisplayProps {
  matrix: ABDMatrix;
}

export function ABDMatrixDisplay({ matrix }: ABDMatrixDisplayProps) {
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
    </Card>
  );
}
