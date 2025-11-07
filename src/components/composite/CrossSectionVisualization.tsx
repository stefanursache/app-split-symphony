import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Canvas as FabricCanvas, Rect, Text as FabricText, Shadow } from 'fabric';
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
      backgroundColor: '#ffffff',
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
    canvas.backgroundColor = '#f8f9fa';

    if (plies.length === 0) {
      const noDataText = new FabricText('Add plies to view cross-section', {
        left: 300,
        top: 200,
        fontSize: 16,
        fill: '#6b7280',
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

    const maxHeight = 320;
    const width = 450;
    const scale = maxHeight / Math.max(totalThickness, 1);
    
    let currentY = 30;
    const startX = 75;
    let zPosition = -totalThickness / 2;

    plies.forEach((ply, index) => {
      const material = materials[ply.material];
      if (!material) return;

      const plyHeight = material.thickness * scale;

      // Draw 3D-like shadow for depth
      const shadow = new Rect({
        left: startX + 5,
        top: currentY + 5,
        width: width,
        height: plyHeight,
        fill: 'rgba(0, 0, 0, 0.15)',
        selectable: false,
      });
      canvas.add(shadow);

      // Draw main ply layer with gradient effect
      const rect = new Rect({
        left: startX,
        top: currentY,
        width: width,
        height: plyHeight,
        fill: material.color,
        stroke: '#d1d5db',
        strokeWidth: 2,
        selectable: false,
        shadow: new Shadow({
          color: 'rgba(0, 0, 0, 0.2)',
          blur: 8,
          offsetX: 0,
          offsetY: 2,
        })
      });

      // Angle indicator - visual representation
      const angleIndicator = new FabricText(
        `↗ ${ply.angle}°`,
        {
          left: startX + width - 70,
          top: currentY + plyHeight / 2,
          fontSize: 11,
          fill: getLuminance(material.color) > 128 ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
          originY: 'center',
          selectable: false,
          fontWeight: 'bold',
        }
      );

      // Main label with material info
      const label = new FabricText(
        `Ply ${index + 1}: ${material.type}`,
        {
          left: startX + 10,
          top: currentY + plyHeight / 2 - 8,
          fontSize: 12,
          fill: getLuminance(material.color) > 128 ? '#000000' : '#FFFFFF',
          originY: 'center',
          selectable: false,
          fontWeight: 'bold',
        }
      );

      // Thickness label
      const thicknessLabel = new FabricText(
        `t = ${material.thickness} mm`,
        {
          left: startX + 10,
          top: currentY + plyHeight / 2 + 8,
          fontSize: 10,
          fill: getLuminance(material.color) > 128 ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          originY: 'center',
          selectable: false,
        }
      );

      // Z-position label (left side)
      const zPosLabel = new FabricText(
        `z = ${zPosition.toFixed(2)}`,
        {
          left: startX - 10,
          top: currentY,
          fontSize: 9,
          fill: '#6b7280',
          originX: 'right',
          selectable: false,
        }
      );

      canvas.add(rect);
      canvas.add(label);
      canvas.add(thicknessLabel);
      canvas.add(angleIndicator);
      canvas.add(zPosLabel);

      zPosition += material.thickness;
      currentY += plyHeight;
    });

    // Final z-position label
    const finalZPosLabel = new FabricText(
      `z = ${zPosition.toFixed(2)}`,
      {
        left: startX - 10,
        top: currentY,
        fontSize: 9,
        fill: '#6b7280',
        originX: 'right',
        selectable: false,
      }
    );
    canvas.add(finalZPosLabel);

    // Add enhanced dimension lines with arrows
    const dimLineY = currentY + 25;
    
    // Horizontal dimension line
    const dimLine = new Rect({
      left: startX,
      top: dimLineY,
      width: width,
      height: 2,
      fill: '#3b82f6',
      selectable: false,
    });
    
    // Left arrow
    const leftArrow = new FabricText('◄', {
      left: startX - 10,
      top: dimLineY - 8,
      fontSize: 14,
      fill: '#3b82f6',
      selectable: false,
    });
    
    // Right arrow
    const rightArrow = new FabricText('►', {
      left: startX + width + 5,
      top: dimLineY - 8,
      fontSize: 14,
      fill: '#3b82f6',
      selectable: false,
    });

    canvas.add(dimLine);
    canvas.add(leftArrow);
    canvas.add(rightArrow);

    // Total thickness label with background
    const totalLabelBg = new Rect({
      left: startX + width / 2 - 65,
      top: dimLineY + 10,
      width: 130,
      height: 25,
      fill: '#3b82f6',
      rx: 4,
      ry: 4,
      selectable: false,
    });

    const totalLabel = new FabricText(`Total: ${totalThickness.toFixed(2)} mm`, {
      left: startX + width / 2,
      top: dimLineY + 22,
      fontSize: 13,
      fill: '#ffffff',
      fontWeight: 'bold',
      originX: 'center',
      originY: 'center',
      selectable: false,
    });

    canvas.add(totalLabelBg);
    canvas.add(totalLabel);

    // Add coordinate system indicator
    const coordText = new FabricText('z', {
      left: 20,
      top: 30,
      fontSize: 16,
      fill: '#6b7280',
      fontStyle: 'italic',
      selectable: false,
    });
    
    const coordArrow = new FabricText('↓', {
      left: 20,
      top: 50,
      fontSize: 14,
      fill: '#6b7280',
      selectable: false,
    });

    canvas.add(coordText);
    canvas.add(coordArrow);

    canvas.renderAll();
  }, [plies, materials]);

  // Get unique materials for legend
  const uniqueMaterials = Array.from(new Set(plies.map(p => p.material)))
    .map(matName => materials[matName])
    .filter(Boolean);

  return (
    <Card className="p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Laminate Cross-Section</h3>
          <p className="text-xs text-muted-foreground mt-1">Through-thickness view with z-coordinates</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-foreground">
            {plies.length} {plies.length === 1 ? 'Ply' : 'Plies'}
          </div>
          <div className="text-xs text-muted-foreground">
            {plies.reduce((sum, ply) => sum + (materials[ply.material]?.thickness || 0), 0).toFixed(2)} mm total
          </div>
        </div>
      </div>

      {/* Material Legend */}
      {plies.length > 0 && (
        <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border">
          <div className="text-xs font-semibold text-foreground mb-2">Material Legend</div>
          <div className="grid grid-cols-2 gap-2">
            {uniqueMaterials.map((material, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-border flex-shrink-0"
                  style={{ backgroundColor: material.color }}
                />
                <span className="text-xs text-foreground truncate">{material.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center bg-background rounded-lg p-4 border border-border">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      {/* Info Footer */}
      {plies.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted/20 rounded">
            <div className="text-xs text-muted-foreground">Min Angle</div>
            <div className="text-sm font-medium text-foreground">
              {Math.min(...plies.map(p => p.angle))}°
            </div>
          </div>
          <div className="p-2 bg-muted/20 rounded">
            <div className="text-xs text-muted-foreground">Max Angle</div>
            <div className="text-sm font-medium text-foreground">
              {Math.max(...plies.map(p => p.angle))}°
            </div>
          </div>
          <div className="p-2 bg-muted/20 rounded">
            <div className="text-xs text-muted-foreground">Materials</div>
            <div className="text-sm font-medium text-foreground">
              {uniqueMaterials.length}
            </div>
          </div>
        </div>
      )}
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
