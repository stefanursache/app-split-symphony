import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FailureResult } from '@/utils/failureAnalysis';

interface PlyFailureAnalysisProps {
  results: FailureResult[];
}

export function PlyFailureAnalysis({ results }: PlyFailureAnalysisProps) {
  if (results.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Ply-by-Ply Failure Analysis
        </h3>
        <p className="text-muted-foreground text-center py-8">
          Add plies and calculate stress to see failure analysis results
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Ply-by-Ply Failure Analysis
      </h3>

      <div className="space-y-3">
        {results.map((result) => (
          <Card
            key={result.ply}
            className={`p-4 border-2 ${
              result.isPassed
                ? 'border-cyan-500/30 bg-card'
                : 'border-destructive/30 bg-destructive/5'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-foreground">
                Ply {result.ply}: {result.material} @ {result.angle}°
              </h4>
              <Badge
                variant={result.isPassed ? 'default' : 'destructive'}
                className={result.isPassed ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : ''}
              >
                {result.isPassed ? 'SAFE' : 'FAIL'}
              </Badge>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Failure Index (FI):</span>
                <span className={result.isPassed ? 'text-foreground' : 'text-destructive'}>
                  {result.failureIndex.toFixed(3)} ({result.isPassed ? 'PASS' : 'FAIL'})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Calculated Safety Factor:</span>
                <span className={result.isPassed ? 'text-cyan-400' : 'text-destructive'}>
                  {result.failureIndex > 0 ? (1 / result.failureIndex).toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Safety Margin:</span>
                <span className={result.isPassed ? 'text-cyan-400' : 'text-destructive'}>
                  {result.safetyMargin.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Failure Mode:</span>
                <span className="text-foreground">{result.failureMode}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
