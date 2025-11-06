import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Material } from '@/types/materials';
import { Edit2, Plus } from 'lucide-react';

interface MaterialSelectorProps {
  materials: Record<string, Material>;
  selectedMaterial: string;
  onSelectMaterial: (name: string) => void;
  onEditMaterial: (name: string) => void;
  onAddMaterial: () => void;
}

export function MaterialSelector({
  materials,
  selectedMaterial,
  onSelectMaterial,
  onEditMaterial,
  onAddMaterial
}: MaterialSelectorProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Material Selection</h2>
        <Button onClick={onAddMaterial} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Material
        </Button>
      </div>
      
      <div className="grid gap-3">
        {Object.values(materials).map((material) => (
          <div
            key={material.name}
            className={`
              relative p-4 rounded-lg border-2 transition-all cursor-pointer
              ${selectedMaterial === material.name
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
              }
            `}
            onClick={() => onSelectMaterial(material.name)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-md border-2 border-border"
                  style={{ backgroundColor: material.color }}
                />
                <div>
                  <div className="font-medium text-foreground">{material.name}</div>
                  <div className="text-sm text-muted-foreground">{material.type}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditMaterial(material.name);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
