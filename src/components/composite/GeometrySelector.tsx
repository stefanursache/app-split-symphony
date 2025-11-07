import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GeometryType, GeometryConfig } from '@/types/geometry';

interface GeometrySelectorProps {
  geometry: GeometryConfig;
  onGeometryChange: (geometry: GeometryConfig) => void;
  totalThickness: number;
}

export function GeometrySelector({ geometry, onGeometryChange, totalThickness }: GeometrySelectorProps) {
  const handleTypeChange = (type: GeometryType) => {
    onGeometryChange({
      ...geometry,
      type,
      ...(type === 'tube' ? {
        innerDiameter: geometry.innerDiameter || 124
      } : {})
    });
  };

  const innerDiameter = geometry.innerDiameter || 124;
  const outerDiameter = innerDiameter + (2 * totalThickness);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Geometry Configuration</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Geometry Type</Label>
          <RadioGroup
            value={geometry.type}
            onValueChange={(value) => handleTypeChange(value as GeometryType)}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="plate" id="plate" />
              <Label htmlFor="plate" className="font-normal cursor-pointer">
                Flat Plate (Classical Lamination Theory)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tube" id="tube" />
              <Label htmlFor="tube" className="font-normal cursor-pointer">
                Circular Tube (Thin-wall theory)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {geometry.type === 'tube' ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="innerDiameter" className="text-sm">
                Inner Diameter (mm)
              </Label>
              <Input
                id="innerDiameter"
                type="number"
                value={innerDiameter}
                onChange={(e) => onGeometryChange({
                  ...geometry,
                  innerDiameter: parseFloat(e.target.value) || 0
                })}
                className="mt-1"
              />
            </div>
            <div className="bg-muted/30 p-3 rounded-md border border-border">
              <p className="text-xs text-muted-foreground mb-1">Calculated dimensions:</p>
              <p className="text-sm">
                <span className="font-medium">Outer Diameter:</span> {outerDiameter.toFixed(2)} mm
              </p>
              <p className="text-sm">
                <span className="font-medium">Wall Thickness:</span> {totalThickness.toFixed(2)} mm
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 p-3 rounded-md border border-border">
            <p className="text-sm text-muted-foreground">
              Classical Lamination Theory analyzes the laminate on a <span className="font-medium">per-unit-width basis</span>.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Loads are applied as forces/moments per unit width (N/mm, N). 
              Actual plate dimensions do not affect stress/strain calculations.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
