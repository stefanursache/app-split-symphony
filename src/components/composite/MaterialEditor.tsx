import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Material } from '@/types/materials';
import { useState, useEffect } from 'react';

interface MaterialEditorProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
  onSave: (material: Material, oldName?: string) => void;
}

export function MaterialEditor({ isOpen, onClose, material, onSave }: MaterialEditorProps) {
  const [formData, setFormData] = useState<Material>({
    name: '',
    type: '',
    E1: 0,
    E2: 0,
    G12: 0,
    nu12: 0,
    tensile_strength: 0,
    compressive_strength: 0,
    shear_strength: 0,
    thermal_resistance: 0,
    density: 0,
    thickness: 0,
    color: '#1FB8CD'
  });

  useEffect(() => {
    if (material) {
      setFormData(material);
    } else {
      setFormData({
        name: '',
        type: '',
        E1: 0,
        E2: 0,
        G12: 0,
        nu12: 0,
        tensile_strength: 0,
        compressive_strength: 0,
        shear_strength: 0,
        thermal_resistance: 0,
        density: 0,
        thickness: 0,
        color: '#1FB8CD'
      });
    }
  }, [material, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, material?.name);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {material ? 'Edit Material' : 'Add New Material'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Material Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!!material}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="E1">E1 (MPa)</Label>
              <Input
                id="E1"
                type="number"
                value={formData.E1}
                onChange={(e) => setFormData({ ...formData, E1: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="E2">E2 (MPa)</Label>
              <Input
                id="E2"
                type="number"
                value={formData.E2}
                onChange={(e) => setFormData({ ...formData, E2: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="G12">G12 (MPa)</Label>
              <Input
                id="G12"
                type="number"
                value={formData.G12}
                onChange={(e) => setFormData({ ...formData, G12: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="nu12">Poisson's Ratio (ν12)</Label>
              <Input
                id="nu12"
                type="number"
                step="0.01"
                value={formData.nu12}
                onChange={(e) => setFormData({ ...formData, nu12: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tensile">Tensile Strength (MPa)</Label>
              <Input
                id="tensile"
                type="number"
                value={formData.tensile_strength || ''}
                onChange={(e) => setFormData({ ...formData, tensile_strength: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="compressive">Compressive Strength (MPa)</Label>
              <Input
                id="compressive"
                type="number"
                value={formData.compressive_strength || ''}
                onChange={(e) => setFormData({ ...formData, compressive_strength: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="shear">Shear Strength (MPa)</Label>
              <Input
                id="shear"
                type="number"
                value={formData.shear_strength || ''}
                onChange={(e) => setFormData({ ...formData, shear_strength: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="thermal">Thermal Resistance (°C)</Label>
              <Input
                id="thermal"
                type="number"
                value={formData.thermal_resistance}
                onChange={(e) => setFormData({ ...formData, thermal_resistance: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="density">Density (g/cm³)</Label>
              <Input
                id="density"
                type="number"
                step="0.01"
                value={formData.density}
                onChange={(e) => setFormData({ ...formData, density: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="thickness">Thickness (mm)</Label>
              <Input
                id="thickness"
                type="number"
                step="0.01"
                value={formData.thickness}
                onChange={(e) => setFormData({ ...formData, thickness: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {material ? 'Update Material' : 'Add Material'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
