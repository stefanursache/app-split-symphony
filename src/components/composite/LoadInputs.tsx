import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loads } from '@/types/materials';
import { Activity } from 'lucide-react';

interface LoadInputsProps {
  loads: Loads;
  onUpdateLoads: (loads: Partial<Loads>) => void;
  onCalculate: () => void;
}

export function LoadInputs({ loads, onUpdateLoads, onCalculate }: LoadInputsProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Load Inputs</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="axialLoad" className="flex items-center justify-between">
            <span>Axial Load, F<sub>z</sub> (N)</span>
            <span className="text-xs text-muted-foreground font-normal">Along z-axis</span>
          </Label>
          <Input
            id="axialLoad"
            type="number"
            value={loads.axial}
            onChange={(e) => onUpdateLoads({ axial: Number(e.target.value) })}
            className="mt-1"
            placeholder="e.g., 4750"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Positive = Tension, Negative = Compression
          </p>
        </div>

        <div>
          <Label htmlFor="bendingLoad" className="flex items-center justify-between">
            <span>Bending Moment, M<sub>x</sub> (N·mm)</span>
            <span className="text-xs text-muted-foreground font-normal">About x-axis</span>
          </Label>
          <Input
            id="bendingLoad"
            type="number"
            value={loads.bending}
            onChange={(e) => onUpdateLoads({ bending: Number(e.target.value) })}
            className="mt-1"
            placeholder="e.g., 10000"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Causes bending in y-z plane
          </p>
        </div>

        <div>
          <Label htmlFor="torsionLoad" className="flex items-center justify-between">
            <span>Torsional Moment, M<sub>z</sub> (N·mm)</span>
            <span className="text-xs text-muted-foreground font-normal">About z-axis</span>
          </Label>
          <Input
            id="torsionLoad"
            type="number"
            value={loads.torsion}
            onChange={(e) => onUpdateLoads({ torsion: Number(e.target.value) })}
            className="mt-1"
            placeholder="e.g., 5000"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Twisting moment along length
          </p>
        </div>

        <Button onClick={onCalculate} className="w-full">
          Calculate Stress/Strain
        </Button>
      </div>
    </Card>
  );
}
