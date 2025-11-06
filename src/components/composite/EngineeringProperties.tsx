import { Card } from '@/components/ui/card';
import { EngineeringProperties as Props } from '@/types/materials';

interface EngineeringPropertiesProps {
  properties: Props | null;
}

export function EngineeringProperties({ properties }: EngineeringPropertiesProps) {
  if (!properties || properties.thickness === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Engineering Properties</h3>
        <p className="text-muted-foreground">Add plies to calculate properties</p>
      </Card>
    );
  }

  const items = [
    { label: 'Ex (Longitudinal)', value: `${(properties.Ex / 1000).toFixed(1)} GPa` },
    { label: 'Ey (Transverse)', value: `${(properties.Ey / 1000).toFixed(1)} GPa` },
    { label: 'Gxy (Shear)', value: `${(properties.Gxy / 1000).toFixed(2)} GPa` },
    { label: 'νxy (Poisson)', value: properties.nuxy.toFixed(3) },
    { label: 'Total Thickness', value: `${properties.thickness.toFixed(2)} mm` }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Engineering Properties</h3>
      <div className="grid gap-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-lg font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
