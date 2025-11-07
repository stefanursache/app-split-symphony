import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield } from 'lucide-react';
import { BucklingResult } from '@/utils/bucklingAnalysis';

interface BucklingResultsProps {
  result: BucklingResult;
}

export function BucklingResults({ result }: BucklingResultsProps) {
  if (!result.buckling_factor) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Buckling Analysis
          </h3>
        </div>
        <p className="text-muted-foreground">{result.buckling_mode}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Buckling Analysis
        </h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Buckling Mode:</p>
            <p className="text-base font-semibold text-foreground">{result.buckling_mode}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Buckling Factor:</p>
            <p className={`text-lg font-semibold ${
              result.buckling_factor < 1 ? 'text-destructive' :
              result.buckling_factor < 1.5 ? 'text-orange-500' : 'text-green-500'
            }`}>
              {result.buckling_factor.toFixed(2)}
            </p>
          </div>
        </div>

        {result.is_buckling_concern && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Buckling factor is below 1.5. Design may be susceptible to buckling failure.
              {result.buckling_factor < 1 && " CRITICAL: Structure will buckle under current loads!"}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
          {result.critical_load_Nx !== null && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Critical Nx:</p>
              <p className="text-sm font-mono text-foreground">
                {result.critical_load_Nx.toFixed(2)} N/mm
              </p>
            </div>
          )}
          {result.critical_load_Ny !== null && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Critical Ny:</p>
              <p className="text-sm font-mono text-foreground">
                {result.critical_load_Ny.toFixed(2)} N/mm
              </p>
            </div>
          )}
          {result.critical_load_Nxy !== null && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Critical Nxy:</p>
              <p className="text-sm font-mono text-foreground">
                {result.critical_load_Nxy.toFixed(2)} N/mm
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-2">Interpretation:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc ml-5">
            <li>Buckling Factor &gt; 1.5: Safe against buckling</li>
            <li>Buckling Factor 1.0 - 1.5: Marginal, consider redesign</li>
            <li>Buckling Factor &lt; 1.0: Structure will buckle under current loads</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
