import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Ply, Material } from '@/types/materials';
import { Plus, Trash2, Layers, Weight, Check, X, Pencil } from 'lucide-react';
import { useState, useMemo } from 'react';

interface PlyStackProps {
  plies: Ply[];
  materials: Record<string, Material>;
  selectedMaterial: string;
  onAddPly: (material: string, angle: number) => void;
  onRemovePly: (index: number) => void;
  onUpdatePly: (index: number, angle: number) => void;
  onClearPlies: () => void;
}

export function PlyStack({
  plies,
  materials,
  selectedMaterial,
  onAddPly,
  onRemovePly,
  onUpdatePly,
  onClearPlies
}: PlyStackProps) {
  const [angle, setAngle] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editAngle, setEditAngle] = useState<number>(0);

  const handleAddPly = () => {
    onAddPly(selectedMaterial, angle);
  };

  const handleStartEdit = (index: number, currentAngle: number) => {
    setEditingIndex(index);
    setEditAngle(currentAngle);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      onUpdatePly(editingIndex, editAngle);
      setEditingIndex(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  // Calculate totals
  const totals = useMemo(() => {
    if (plies.length === 0) {
      return { thickness: 0, weight: 0, count: 0 };
    }

    let totalThickness = 0;
    let totalWeight = 0;

    plies.forEach(ply => {
      const material = materials[ply.material];
      if (!material) return;
      
      totalThickness += material.thickness;
      // Weight calculation: density (g/cm³) * thickness (mm) * area (assuming 1 m² = 1000000 mm²)
      // Simplified: density * thickness gives g/m² directly
      totalWeight += material.density * material.thickness * 1000;
    });

    return {
      thickness: totalThickness,
      weight: totalWeight,
      count: plies.length
    };
  }, [plies, materials]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Ply Stack</h2>
        </div>
        <Button
          onClick={onClearPlies}
          variant="outline"
          size="sm"
          disabled={plies.length === 0}
        >
          Clear All
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          type="number"
          value={angle}
          onChange={(e) => setAngle(Number(e.target.value))}
          placeholder="Angle (°)"
          className="w-32"
        />
        <Button onClick={handleAddPly} className="gap-2 flex-1">
          <Plus className="h-4 w-4" />
          Add Ply
        </Button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {plies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No plies added yet. Add your first ply above.
          </div>
        ) : (
          plies.map((ply, index) => {
            const material = materials[ply.material];
            if (!material) return null;
            
            const isEditing = editingIndex === index;
            
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded border border-border flex-shrink-0"
                  style={{ backgroundColor: material.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">
                    Ply {index + 1}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {material.name}
                  </div>
                </div>
                
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editAngle}
                      onChange={(e) => setEditAngle(Number(e.target.value))}
                      className="w-20 h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <span className="text-xs text-muted-foreground">°</span>
                    <Button
                      onClick={handleSaveEdit}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm text-foreground min-w-[60px] text-right">
                      {ply.angle}°
                    </div>
                    <Button
                      onClick={() => handleStartEdit(index, ply.angle)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => onRemovePly(index)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {plies.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Plies:</span>
            <span className="font-semibold text-foreground">{totals.count}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Thickness:</span>
            <span className="font-semibold text-foreground">{totals.thickness.toFixed(2)} mm</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Weight className="h-3 w-3" />
              Total Weight:
            </span>
            <span className="font-semibold text-foreground">{totals.weight.toFixed(0)} g/m²</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground text-center">
          Add plies to see totals
        </div>
      )}
    </Card>
  );
}
