import { Card } from '@/components/ui/card';
import { Material } from '@/types/materials';

interface MaterialPropertiesProps {
  material: Material | null;
}

export function MaterialProperties({ material }: MaterialPropertiesProps) {
  if (!material) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Material Properties</h3>
        <p className="text-muted-foreground">Select a material to view properties</p>
      </Card>
    );
  }

  const properties = [
    { label: 'Tensile Strength', value: `${material.tensile_strength} MPa` },
    { label: 'E-Modulus', value: `${(material.E1 / 1000).toFixed(1)} GPa` },
    { label: 'Shear Strength', value: `${material.shear_strength} MPa` },
    { label: 'G-Modulus', value: `${(material.G12 / 1000).toFixed(2)} GPa` },
    { label: 'Thermal Resistance', value: `${material.thermal_resistance}°C` },
    { label: 'Density', value: `${material.density} g/cm³` }
  ];

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Material Properties</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {properties.map((prop, index) => (
          <div key={index} className="space-y-1">
            <div className="text-xs sm:text-sm text-muted-foreground">{prop.label}</div>
            <div className="text-base sm:text-lg font-medium text-foreground break-words">{prop.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
