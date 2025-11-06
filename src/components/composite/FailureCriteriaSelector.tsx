import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FailureCriteriaSelectorProps {
  failureCriterion: string;
  safetyFactor: number;
  onCriterionChange: (criterion: string) => void;
  onSafetyFactorChange: (factor: number) => void;
}

export function FailureCriteriaSelector({
  failureCriterion,
  safetyFactor,
  onCriterionChange,
  onSafetyFactorChange,
}: FailureCriteriaSelectorProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Failure Criteria Selection
      </h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="failureCriterion">Failure Criterion:</Label>
          <Select value={failureCriterion} onValueChange={onCriterionChange}>
            <SelectTrigger id="failureCriterion" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="max_stress">Maximum Stress</SelectItem>
              <SelectItem value="tsai_wu">Tsai-Wu</SelectItem>
              <SelectItem value="tsai_hill">Tsai-Hill</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="safetyFactor">Safety Factor:</Label>
          <Input
            id="safetyFactor"
            type="number"
            step="0.1"
            min="1"
            value={safetyFactor}
            onChange={(e) => onSafetyFactorChange(Number(e.target.value))}
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Minimum recommended: 1.5-2.0
          </p>
        </div>
      </div>
    </Card>
  );
}
