import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Layers, AlertTriangle } from 'lucide-react';
import { InterlaminarStressResult, assessDelaminationRisk } from '@/utils/interlaminarStress';

interface InterlaminarStressResultsProps {
  results: InterlaminarStressResult[];
}

export function InterlaminarStressResults({ results }: InterlaminarStressResultsProps) {
  if (results.length === 0) {
    return null;
  }

  const riskAssessment = assessDelaminationRisk(results);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Interlaminar Stress Analysis
        </h3>
      </div>

      <div className="space-y-4">
        {/* Overall Risk Assessment */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Overall Risk:</p>
            <Badge variant={getRiskColor(riskAssessment.overallRisk)} className="mt-1">
              {riskAssessment.overallRisk}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Max Shear Stress:</p>
            <p className="text-lg font-semibold text-foreground">
              {riskAssessment.maxShearStress.toFixed(2)} MPa
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Critical Interfaces:</p>
            <p className="text-lg font-semibold text-foreground">
              {riskAssessment.criticalInterfaces.length}
            </p>
          </div>
        </div>

        {/* High Risk Warning */}
        {riskAssessment.overallRisk === 'High' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              High delamination risk detected at interfaces: {riskAssessment.criticalInterfaces.join(', ')}.
              Consider reducing ply angle changes or adding interleaf layers.
            </AlertDescription>
          </Alert>
        )}

        {/* Interface Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-foreground">Interface</th>
                <th className="text-right py-2 px-2 text-foreground">z (mm)</th>
                <th className="text-right py-2 px-2 text-foreground">σz (MPa)</th>
                <th className="text-right py-2 px-2 text-foreground">τxz (MPa)</th>
                <th className="text-right py-2 px-2 text-foreground">τyz (MPa)</th>
                <th className="text-center py-2 px-2 text-foreground">Risk</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.interface_number} className="border-b border-border/50">
                  <td className="py-2 px-2 text-foreground">
                    {result.interface_number}
                  </td>
                  <td className="text-right py-2 px-2 text-muted-foreground font-mono">
                    {result.z.toFixed(3)}
                  </td>
                  <td className="text-right py-2 px-2 text-foreground font-mono">
                    {result.sigma_z.toFixed(2)}
                  </td>
                  <td className="text-right py-2 px-2 text-foreground font-mono">
                    {result.tau_xz.toFixed(2)}
                  </td>
                  <td className="text-right py-2 px-2 text-foreground font-mono">
                    {result.tau_yz.toFixed(2)}
                  </td>
                  <td className="text-center py-2 px-2">
                    <Badge variant={getRiskColor(result.delamination_risk)} className="text-xs">
                      {result.delamination_risk}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Interpretation */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-2">Interpretation:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc ml-5">
            <li>σz: Out-of-plane normal stress (tension/compression through thickness)</li>
            <li>τxz, τyz: Interlaminar shear stresses (can cause delamination)</li>
            <li>High risk interfaces may require design modifications</li>
            <li>Large ply angle changes increase delamination susceptibility</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
