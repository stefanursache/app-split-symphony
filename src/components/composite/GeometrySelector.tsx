import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GeometryType, GeometryConfig } from '@/types/geometry';

interface GeometrySelectorProps {
  geometry: GeometryConfig;
  onGeometryChange: (geometry: GeometryConfig) => void;
}

export function GeometrySelector({ geometry, onGeometryChange }: GeometrySelectorProps) {
  const handleTypeChange = (type: GeometryType) => {
    onGeometryChange({
      ...geometry,
      type,
      ...(type === 'tube' ? {
        outerDiameter: geometry.outerDiameter || 130,
        innerDiameter: geometry.innerDiameter || 124
      } : {
        width: geometry.width || 100,
        length: geometry.length || 100
      })
    });
  };

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
              <Label htmlFor="outerDiameter" className="text-sm">
                Outer Diameter (mm)
              </Label>
              <Input
                id="outerDiameter"
                type="number"
                value={geometry.outerDiameter || 130}
                onChange={(e) => onGeometryChange({
                  ...geometry,
                  outerDiameter: parseFloat(e.target.value) || 0
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="innerDiameter" className="text-sm">
                Inner Diameter (mm)
              </Label>
              <Input
                id="innerDiameter"
                type="number"
                value={geometry.innerDiameter || 124}
                onChange={(e) => onGeometryChange({
                  ...geometry,
                  innerDiameter: parseFloat(e.target.value) || 0
                })}
                className="mt-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Wall thickness: {((geometry.outerDiameter || 130) - (geometry.innerDiameter || 124)) / 2} mm
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="width" className="text-sm">
                Width (mm)
              </Label>
              <Input
                id="width"
                type="number"
                value={geometry.width || 100}
                onChange={(e) => onGeometryChange({
                  ...geometry,
                  width: parseFloat(e.target.value) || 0
                })}
                className="mt-1"
                placeholder="Per unit width analysis"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Loads will be applied as forces/moments per unit width
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
