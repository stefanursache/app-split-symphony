import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Material, Ply, StressResult } from '@/types/materials';
import * as THREE from 'three';

interface LaminateVisualization3DProps {
  plies: Ply[];
  materials: Record<string, Material>;
  stressResults?: StressResult[];
}

interface PlyLayerProps {
  ply: Ply;
  material: Material;
  position: [number, number, number];
  thickness: number;
  stress?: number;
  index: number;
}

const PlyLayer = ({ ply, material, position, thickness, stress, index }: PlyLayerProps) => {
  // Color based on stress or material
  const getColor = () => {
    if (stress !== undefined) {
      const normalized = Math.min(stress / 100, 1); // Normalize stress (assuming max 100 MPa)
      return new THREE.Color().setHSL(0.66 - normalized * 0.66, 1, 0.5); // Blue to red gradient
    }
    return new THREE.Color(material.color || '#4A90E2');
  };

  const color = getColor();
  
  // Scale for visualization (plies are typically thin)
  const visualThickness = thickness * 50;
  const width = 4;
  const length = 4;

  // Fiber orientation lines
  const fiberLines = [];
  const angleRad = (ply.angle * Math.PI) / 180;
  const numLines = 8;
  const spacing = width / (numLines + 1);

  for (let i = 0; i < numLines; i++) {
    const offset = -width / 2 + spacing * (i + 1);
    const lineLength = length;
    const dx = Math.cos(angleRad) * lineLength;
    const dy = Math.sin(angleRad) * lineLength;
    
    fiberLines.push({
      start: [offset * Math.cos(angleRad) - dy / 2, position[1], offset * Math.sin(angleRad) + dx / 2],
      end: [offset * Math.cos(angleRad) + dy / 2, position[1], offset * Math.sin(angleRad) - dx / 2],
    });
  }

  return (
    <group position={position}>
      {/* Ply box */}
      <mesh>
        <boxGeometry args={[width, visualThickness, length]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Fiber orientation lines */}
      {fiberLines.map((line, i) => (
        <Line
          key={i}
          points={[line.start as [number, number, number], line.end as [number, number, number]]}
          color="white"
          lineWidth={1.5}
          transparent
          opacity={0.8}
        />
      ))}

      {/* Ply label */}
      <Text
        position={[width / 2 + 0.5, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="left"
        anchorY="middle"
      >
        {`#${index + 1}: ${ply.angle}°`}
      </Text>
    </group>
  );
};

const Scene = ({ plies, materials, stressResults }: LaminateVisualization3DProps) => {
  // Calculate positions for each ply
  let currentY = 0;
  const plyPositions: { ply: Ply; position: [number, number, number]; thickness: number; stress?: number }[] = [];

  plies.forEach((ply, index) => {
    const material = materials[ply.material];
    if (!material) return;

    const thickness = material.thickness || 0.125;
    const visualThickness = thickness * 50;
    
    plyPositions.push({
      ply,
      position: [0, currentY + visualThickness / 2, 0],
      thickness,
      stress: stressResults?.[index]?.von_mises,
    });

    currentY += visualThickness;
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      
      {/* Ply layers */}
      {plyPositions.map((data, index) => (
        <PlyLayer
          key={index}
          ply={data.ply}
          material={materials[data.ply.material]}
          position={data.position}
          thickness={data.thickness}
          stress={data.stress}
          index={index}
        />
      ))}

      {/* Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
      />
    </>
  );
};

export const LaminateVisualization3D = ({ plies, materials, stressResults }: LaminateVisualization3DProps) => {
  if (plies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>3D Laminate Visualization</CardTitle>
          <CardDescription>
            Add plies to see 3D visualization
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalThickness = plies.reduce((sum, ply) => {
    const material = materials[ply.material];
    return sum + (material?.thickness || 0.125);
  }, 0);

  const hasStressData = stressResults && stressResults.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>3D Laminate Visualization</CardTitle>
            <CardDescription>
              Interactive 3D view of laminate stack with fiber orientations
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">
              {plies.length} {plies.length === 1 ? 'Ply' : 'Plies'}
            </Badge>
            <Badge variant="secondary">
              {totalThickness.toFixed(3)} mm
            </Badge>
            {hasStressData && (
              <Badge variant="default">
                Stress Mapped
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[600px] w-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden">
            <Canvas
              camera={{ position: [8, 5, 8], fov: 50 }}
              shadows
            >
              <Scene plies={plies} materials={materials} stressResults={stressResults} />
            </Canvas>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium mb-1">Controls</div>
              <div className="text-muted-foreground space-y-1">
                <div>• Left click + drag: Rotate</div>
                <div>• Right click + drag: Pan</div>
                <div>• Scroll: Zoom</div>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium mb-1">Visualization</div>
              <div className="text-muted-foreground space-y-1">
                <div>• White lines: Fiber direction</div>
                <div>• Labels: Ply # and angle</div>
                <div>• Colors: {hasStressData ? 'Stress level' : 'Material type'}</div>
              </div>
            </div>

            {hasStressData && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium mb-1">Stress Scale</div>
                <div className="text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(240, 100%, 50%)' }} />
                    <span>Low stress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(0, 100%, 50%)' }} />
                    <span>High stress</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
