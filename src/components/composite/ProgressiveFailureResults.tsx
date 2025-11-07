import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { ProgressiveFailureAnalysis } from '@/utils/progressiveFailure';

interface ProgressiveFailureResultsProps {
  analysis: ProgressiveFailureAnalysis;
}

export function ProgressiveFailureResults({ analysis }: ProgressiveFailureResultsProps) {
  const latestStep = analysis.steps[analysis.steps.length - 1];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Progressive Failure Analysis
        </h3>
      </div>

      <div className="space-y-4">
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {analysis.firstPlyFailure && (
            <div>
              <p className="text-muted-foreground">First Ply Failure:</p>
              <p className="text-lg font-semibold text-foreground">
                Ply {analysis.firstPlyFailure.ply}
              </p>
              <p className="text-xs text-muted-foreground">
                Iteration {analysis.firstPlyFailure.iteration}
              </p>
            </div>
          )}
          
          {analysis.lastPlyFailure && (
            <div>
              <p className="text-muted-foreground">Last Ply Failure:</p>
              <p className="text-lg font-semibold text-foreground">
                Ply {analysis.lastPlyFailure.ply}
              </p>
              <p className="text-xs text-muted-foreground">
                Iteration {analysis.lastPlyFailure.iteration}
              </p>
            </div>
          )}

          <div>
            <p className="text-muted-foreground">Ultimate Strength:</p>
            <p className="text-lg font-semibold text-foreground">
              {analysis.ultimateStrength.toFixed(2)}×
            </p>
            <p className="text-xs text-muted-foreground">
              Load multiplier
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">Failed Plies:</p>
            <p className="text-lg font-semibold text-foreground">
              {latestStep.failedPlies.length}
            </p>
            <p className="text-xs text-muted-foreground">
              out of {analysis.steps[0].stressResults.length}
            </p>
          </div>
        </div>

        {/* Safety Assessment */}
        {analysis.ultimateStrength < 2.0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ultimate strength multiplier is below 2.0. Consider increasing laminate thickness or 
              optimizing ply orientations for better progressive failure behavior.
            </AlertDescription>
          </Alert>
        )}

        {/* Failed Plies List */}
        {latestStep.failedPlies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Failed Plies:</h4>
            <div className="flex flex-wrap gap-2">
              {latestStep.failedPlies.map((plyNum) => (
                <Badge key={plyNum} variant="destructive">
                  Ply {plyNum}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Progressive Failure Steps */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Failure Progression:</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {analysis.steps.slice(1).map((step) => (
              <div key={step.iteration} className="text-sm border border-border rounded p-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">
                    Iteration {step.iteration}
                  </span>
                  <span className="text-muted-foreground">
                    FI: {step.maxFailureIndex.toFixed(3)}
                  </span>
                </div>
                {step.failedPlies.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Failed: Plies {step.failedPlies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Interpretation */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-2">Interpretation:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc ml-5">
            <li>Progressive failure tracks ply degradation after initial failure</li>
            <li>Ultimate strength shows load capacity beyond first-ply failure</li>
            <li>Higher ultimate strength indicates more ductile failure behavior</li>
            <li>Sudden failure (low iteration count) indicates brittle behavior</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
