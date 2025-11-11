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
  isAuthenticated?: boolean;
}

export function MaterialSelector({
  materials,
  selectedMaterial,
  onSelectMaterial,
  onEditMaterial,
  onAddMaterial,
  isAuthenticated = false
}: MaterialSelectorProps) {
  return (
    <Card className="p-3 sm:p-6 w-full min-w-0">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-base sm:text-xl font-semibold text-foreground">Material Selection</h2>
        <Button onClick={onAddMaterial} size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Add Material</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
      
      <div className="grid gap-3 w-full">
        {Object.values(materials).map((material) => (
          <div
            key={material.name}
            className={`
              relative p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer w-full min-w-0
              ${selectedMaterial === material.name
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
              }
            `}
            onClick={() => onSelectMaterial(material.name)}
          >
            <div className="flex items-center justify-between gap-2 w-full min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-md border-2 border-border flex-shrink-0"
                  style={{ backgroundColor: material.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm sm:text-base text-foreground truncate">{material.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">{material.type}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditMaterial(material.name);
                }}
              >
                <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
