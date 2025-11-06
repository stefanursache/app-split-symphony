import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Canvas as FabricCanvas, Rect, Text as FabricText } from 'fabric';
import { Material, Ply } from '@/types/materials';

interface CrossSectionVisualizationProps {
  plies: Ply[];
  materials: Record<string, Material>;
}

export function CrossSectionVisualization({ plies, materials }: CrossSectionVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize canvas
    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: 'hsl(var(--card))',
      selection: false,
    });

    fabricCanvasRef.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = 'hsl(var(--card))';

    if (plies.length === 0) {
      const noDataText = new FabricText('Add plies to view cross-section', {
        left: 300,
        top: 200,
        fontSize: 16,
        fill: 'hsl(var(--muted-foreground))',
        originX: 'center',
        originY: 'center',
        selectable: false,
      });
      canvas.add(noDataText);
      canvas.renderAll();
      return;
    }

    // Calculate total thickness and scale
    const totalThickness = plies.reduce((sum, ply) => {
      const material = materials[ply.material];
      return sum + (material?.thickness || 0);
    }, 0);

    const maxHeight = 300;
    const width = 400;
    const scale = maxHeight / Math.max(totalThickness, 1);
    
    let currentY = 50;
    const startX = 100;

    plies.forEach((ply, index) => {
      const material = materials[ply.material];
      if (!material) return;

      const plyHeight = material.thickness * scale;

      // Draw ply layer
      const rect = new Rect({
        left: startX,
        top: currentY,
        width: width,
        height: plyHeight,
        fill: material.color,
        stroke: 'hsl(var(--border))',
        strokeWidth: 1,
        selectable: false,
      });

      // Add label
      const label = new FabricText(
        `${index + 1}: ${material.type} @ ${ply.angle}° (${material.thickness}mm)`,
        {
          left: startX + 10,
          top: currentY + plyHeight / 2,
          fontSize: 12,
          fill: getLuminance(material.color) > 128 ? '#000000' : '#FFFFFF',
          originY: 'center',
          selectable: false,
        }
      );

      canvas.add(rect);
      canvas.add(label);

      currentY += plyHeight;
    });

    // Add dimension lines
    const dimLineY = currentY + 20;
    const dimLine = new Rect({
      left: startX,
      top: dimLineY,
      width: 0,
      height: 2,
      fill: 'hsl(var(--primary))',
      selectable: false,
    });
    canvas.add(dimLine);

    const totalLabel = new FabricText(`Total: ${totalThickness.toFixed(2)} mm`, {
      left: startX + width / 2,
      top: dimLineY + 15,
      fontSize: 14,
      fill: 'hsl(var(--foreground))',
      fontWeight: 'bold',
      originX: 'center',
      selectable: false,
    });
    canvas.add(totalLabel);

    canvas.renderAll();
  }, [plies, materials]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Laminate Cross-Section</h3>
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="border border-border rounded-lg" />
      </div>
    </Card>
  );
}

// Helper function to calculate luminance for text color contrast
function getLuminance(color: string): number {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
