import { Card } from '@/components/ui/card';
import { Check, Info } from 'lucide-react';
import { SafetySummary } from '@/utils/failureAnalysis';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SafetyMarginSummaryProps {
  summary: SafetySummary | null;
}

export function SafetyMarginSummary({ summary }: SafetyMarginSummaryProps) {
  if (!summary || summary.criticalPly === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Safety Margin Summary
      </h3>

      <div className="space-y-3">
        <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-between">
          <span className="text-foreground font-medium flex items-center gap-2">
            Minimum Safety Factor
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">SF = 1 / FI. The lowest safety factor across all plies. Values above 1.0 indicate the laminate is safe.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
          <span className="text-2xl font-bold text-cyan-400">
            {summary.minimumSafetyFactor.toFixed(2)}
          </span>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-between">
          <span className="text-foreground font-medium">Critical Ply</span>
          <span className="text-2xl font-bold text-foreground">
            Ply {summary.criticalPly}
          </span>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-between">
          <span className="text-foreground font-medium">Max Failure Index</span>
          <span className="text-2xl font-bold text-cyan-400">
            {summary.maxFailureIndex.toFixed(4)}
          </span>
        </div>

        {summary.designMeetsSafety && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3 mt-4">
            <Check className="h-5 w-5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">
              Design meets safety requirements
            </span>
          </div>
        )}

        {!summary.designMeetsSafety && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3 mt-4">
            <span className="text-destructive font-medium">
              ⚠ Design does not meet safety requirements
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
