import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loads } from '@/types/materials';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LoadInputsProps {
  loads: Loads;
  onLoadChange: (loads: Partial<Loads>) => void;
}

export function LoadInputs({ loads, onLoadChange }: LoadInputsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Applied Loads (per unit width)</h3>
      
      <div className="space-y-4">
        <div className="bg-muted/30 p-3 rounded-md mb-4">
          <p className="text-xs text-muted-foreground">
            All loads are specified per unit width for CLT analysis
          </p>
        </div>

        {/* In-plane forces */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            In-Plane Forces (N/mm)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Force per unit width applied in the plane of the laminate</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h4>
          
          <div>
            <Label htmlFor="Nx" className="text-sm">
              Nx (Axial)
            </Label>
            <Input
              id="Nx"
              type="number"
              value={loads.Nx}
              onChange={(e) => onLoadChange({ Nx: parseFloat(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="Ny" className="text-sm">
              Ny (Transverse)
            </Label>
            <Input
              id="Ny"
              type="number"
              value={loads.Ny}
              onChange={(e) => onLoadChange({ Ny: parseFloat(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="Nxy" className="text-sm">
              Nxy (In-plane Shear)
            </Label>
            <Input
              id="Nxy"
              type="number"
              value={loads.Nxy}
              onChange={(e) => onLoadChange({ Nxy: parseFloat(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
        </div>

        {/* Moments */}
        <div className="space-y-3 pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Moments (N)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Moment per unit width (N·mm/mm = N)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h4>
          
          <div>
            <Label htmlFor="Mx" className="text-sm">
              Mx (Bending about x-axis)
            </Label>
            <Input
              id="Mx"
              type="number"
              value={loads.Mx}
              onChange={(e) => onLoadChange({ Mx: parseFloat(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="My" className="text-sm">
              My (Bending about y-axis)
            </Label>
            <Input
              id="My"
              type="number"
              value={loads.My}
              onChange={(e) => onLoadChange({ My: parseFloat(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="Mxy" className="text-sm">
              Mxy (Twisting)
            </Label>
            <Input
              id="Mxy"
              type="number"
              value={loads.Mxy}
              onChange={(e) => onLoadChange({ Mxy: parseFloat(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
