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
  safetyFactor: number | null;
  onCriterionChange: (criterion: string) => void;
  onSafetyFactorChange: (factor: number | null) => void;
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
          <Label htmlFor="safetyFactor">Safety Factor (Optional):</Label>
          <Input
            id="safetyFactor"
            type="number"
            step="0.1"
            min="1"
            value={safetyFactor ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              onSafetyFactorChange(value === '' ? null : Number(value));
            }}
            placeholder="Leave empty to calculate per layer"
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">
            If not specified, safety factor will be calculated for each layer based on failure index
          </p>
        </div>
      </div>
    </Card>
  );
}
