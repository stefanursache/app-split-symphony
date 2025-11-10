import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { useState } from "react";
import { Material, Ply } from "@/types/materials";
import { GeometryConfig } from "@/types/geometry";
import { generateAbaqusINP, generateANSYSCDB, downloadFEAFile } from "@/utils/feaExport";
import { toast } from "sonner";

interface FEAExportProps {
  plies: Ply[];
  materials: Record<string, Material>;
  geometry: GeometryConfig;
}

export function FEAExport({ plies, materials, geometry }: FEAExportProps) {
  const [format, setFormat] = useState<'inp' | 'cdb'>('inp');

  const handleExport = () => {
    if (plies.length === 0) {
      toast.error("No plies to export");
      return;
    }

    let content: string;
    let filename: string;

    if (format === 'inp') {
      content = generateAbaqusINP({ plies, materials, geometry, format });
      filename = 'laminate_analysis.inp';
      toast.success("Abaqus .inp file generated");
    } else {
      content = generateANSYSCDB({ plies, materials, geometry, format });
      filename = 'laminate_analysis.cdb';
      toast.success("ANSYS .cdb file generated");
    }

    downloadFEAFile(content, filename);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finite Element Export</CardTitle>
        <CardDescription>
          Export laminate configuration for FEA software (ANSYS, Abaqus, NASTRAN)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Select value={format} onValueChange={(v) => setFormat(v as 'inp' | 'cdb')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inp">Abaqus (.inp)</SelectItem>
              <SelectItem value="cdb">ANSYS (.cdb)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {format === 'inp' 
              ? 'Compatible with Abaqus and NASTRAN' 
              : 'Compatible with ANSYS Mechanical'}
          </p>
        </div>

        <Button onClick={handleExport} className="w-full" disabled={plies.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export for FEA
        </Button>

        {plies.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Add plies to enable export
          </p>
        )}
      </CardContent>
    </Card>
  );
}
