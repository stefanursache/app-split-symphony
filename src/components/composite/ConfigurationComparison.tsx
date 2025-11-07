import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Configuration } from '@/hooks/useConfigurations';
import { ConfigurationActions } from './ConfigurationActions';
import { Layers, Weight, Ruler } from 'lucide-react';

interface ConfigurationComparisonProps {
  configurations: Configuration[];
  loading: boolean;
  currentConfig: Configuration | null;
  onAddCurrent: () => void;
  onLoadConfig: (config: Configuration) => void;
  onDeleteConfig: (id: string) => void;
  isAuthenticated?: boolean;
}

export function ConfigurationComparison({
  configurations,
  loading,
  currentConfig,
  onAddCurrent,
  onLoadConfig,
  onDeleteConfig,
  isAuthenticated = false,
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Saved Configurations</h3>
        <Badge variant="outline">{configurations.length} saved</Badge>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-32 w-full" />
            </Card>
          ))}
        </div>
      ) : configurations.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">No saved configurations yet</p>
            {!isAuthenticated && (
              <p className="text-sm mt-2 text-amber-600 dark:text-amber-500">Sign in to save configurations</p>
            )}
            <p className="text-sm">Create and save your first laminate configuration to compare designs</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {configurations.map((config) => (
            <Card key={config.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-lg mb-1">
                      {config.name}
                    </h4>
                    {config.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {config.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Layers className="h-4 w-4" />
                        <span>{config.plies.length} plies</span>
                      </div>
                      {config.total_thickness && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Ruler className="h-4 w-4" />
                          <span>{config.total_thickness.toFixed(2)} mm</span>
                        </div>
                      )}
                      {config.total_weight && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Weight className="h-4 w-4" />
                          <span>{config.total_weight.toFixed(2)} g</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Ply Stack:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {config.plies.map((ply, index) => (
                      <div
                        key={index}
                        className="text-xs bg-background rounded px-2 py-1 border border-border"
                      >
                        <span className="font-mono text-muted-foreground">#{index + 1}:</span>{' '}
                        <span className="text-foreground">{ply.material}</span>{' '}
                        <span className="text-primary">@ {ply.angle}°</span>
                      </div>
                    ))}
                  </div>
                </div>

                {config.engineering_properties && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Ex</div>
                      <div className="font-medium text-foreground">
                        {config.engineering_properties.Ex.toFixed(0)} MPa
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Ey</div>
                      <div className="font-medium text-foreground">
                        {config.engineering_properties.Ey.toFixed(0)} MPa
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Gxy</div>
                      <div className="font-medium text-foreground">
                        {config.engineering_properties.Gxy.toFixed(0)} MPa
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">νxy</div>
                      <div className="font-medium text-foreground">
                        {config.engineering_properties.nuxy.toFixed(3)}
                      </div>
                    </div>
                  </div>
                )}

                <ConfigurationActions
                  config={config}
                  onLoad={onLoadConfig}
                  onDelete={onDeleteConfig}
                />

                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Created: {new Date(config.created_at).toLocaleDateString()}
                  {config.updated_at !== config.created_at && (
                    <> • Updated: {new Date(config.updated_at).toLocaleDateString()}</>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
