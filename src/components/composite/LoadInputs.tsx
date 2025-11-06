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
          <Label htmlFor="axialLoad">Axial Load (N)</Label>
          <Input
            id="axialLoad"
            type="number"
            value={loads.axial}
            onChange={(e) => onUpdateLoads({ axial: Number(e.target.value) })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="bendingLoad">Bending Moment (N·mm)</Label>
          <Input
            id="bendingLoad"
            type="number"
            value={loads.bending}
            onChange={(e) => onUpdateLoads({ bending: Number(e.target.value) })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="torsionLoad">Torsion (N·mm)</Label>
          <Input
            id="torsionLoad"
            type="number"
            value={loads.torsion}
            onChange={(e) => onUpdateLoads({ torsion: Number(e.target.value) })}
            className="mt-1"
          />
        </div>

        <Button onClick={onCalculate} className="w-full">
          Calculate Stress/Strain
        </Button>
      </div>
    </Card>
  );
}
