import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Configuration } from '@/hooks/useConfigurations';
import { ConfigurationSelector } from './ConfigurationSelector';

interface ConfigurationComparisonProps {
  configurations: Configuration[];
  loading: boolean;
  currentConfig: Configuration | null;
  onAddCurrent: () => void;
}

export function ConfigurationComparison({
  configurations,
  loading,
  currentConfig,
  onAddCurrent,
}: ConfigurationComparisonProps) {
  const [selectedConfigs, setSelectedConfigs] = useState<Configuration[]>([]);

  const addConfiguration = (config: Configuration) => {
    if (!selectedConfigs.find(c => c.id === config.id)) {
      setSelectedConfigs([...selectedConfigs, config]);
    }
  };

  const removeConfiguration = (id: string) => {
    setSelectedConfigs(selectedConfigs.filter(c => c.id !== id));
  };

  const clearAll = () => {
    setSelectedConfigs([]);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Configuration Comparison</h3>
        <div className="flex gap-3 mb-4">
          <Button onClick={onAddCurrent} disabled={!currentConfig}>
            <Plus className="h-4 w-4 mr-2" />
            Add Current Config
          </Button>
          <Button variant="outline" onClick={clearAll} disabled={selectedConfigs.length === 0}>
            Clear All
          </Button>
        </div>

        <ConfigurationSelector
          configurations={configurations}
          loading={loading}
          onSelect={addConfiguration}
          selectedIds={selectedConfigs.map(c => c.id)}
        />
      </Card>

      {selectedConfigs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Add configurations to compare</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Properties Comparison Table */}
          <Card className="p-6 overflow-x-auto">
            <h4 className="text-lg font-semibold mb-4 text-foreground">Properties Comparison</h4>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Property</th>
                  {selectedConfigs.map((config) => (
                    <th key={config.id} className="text-left py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate max-w-[150px]">{config.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeConfiguration(config.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-sm text-muted-foreground">Total Plies</td>
                  {selectedConfigs.map((config) => (
                    <td key={config.id} className="py-3 px-4 font-mono text-sm">
                      {config.plies.length}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-sm text-muted-foreground">Total Thickness (mm)</td>
                  {selectedConfigs.map((config) => (
                    <td key={config.id} className="py-3 px-4 font-mono text-sm">
                      {config.total_thickness?.toFixed(2) || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-sm text-muted-foreground">Total Weight (g/m²)</td>
                  {selectedConfigs.map((config) => (
                    <td key={config.id} className="py-3 px-4 font-mono text-sm">
                      {config.total_weight?.toFixed(2) || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-sm text-muted-foreground">Ex (MPa)</td>
                  {selectedConfigs.map((config) => (
                    <td key={config.id} className="py-3 px-4 font-mono text-sm">
                      {config.engineering_properties?.Ex?.toFixed(0) || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-sm text-muted-foreground">Ey (MPa)</td>
                  {selectedConfigs.map((config) => (
                    <td key={config.id} className="py-3 px-4 font-mono text-sm">
                      {config.engineering_properties?.Ey?.toFixed(0) || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-sm text-muted-foreground">Gxy (MPa)</td>
                  {selectedConfigs.map((config) => (
                    <td key={config.id} className="py-3 px-4 font-mono text-sm">
                      {config.engineering_properties?.Gxy?.toFixed(0) || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-sm text-muted-foreground">νxy</td>
                  {selectedConfigs.map((config) => (
                    <td key={config.id} className="py-3 px-4 font-mono text-sm">
                      {config.engineering_properties?.nuxy?.toFixed(3) || 'N/A'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </Card>

          {/* Ply Stacks */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4 text-foreground">Ply Stacks</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedConfigs.map((config) => (
                <div key={config.id} className="border border-border rounded-lg p-4">
                  <h5 className="font-semibold mb-2 text-sm">{config.name}</h5>
                  <div className="space-y-1">
                    {config.plies.map((ply, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {idx + 1}. {ply.material}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {ply.angle}°
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-2 text-foreground">Design Recommendations</h4>
        <p className="text-sm text-muted-foreground">
          Compare different laminate configurations to find the optimal design for your application.
          Consider trade-offs between weight, stiffness, and manufacturing complexity.
        </p>
      </Card>
    </div>
  );
}
