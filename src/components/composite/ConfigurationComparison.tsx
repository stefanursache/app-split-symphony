import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Configuration } from '@/hooks/useConfigurations';
import { ConfigurationActions } from './ConfigurationActions';
import { Layers, Weight, Ruler, Plus, X, BarChart3, Activity } from 'lucide-react';
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ConfigurationComparisonProps {
  configurations: Configuration[];
  loading: boolean;
  currentConfig: Configuration | null;
  onAddCurrent: () => void;
  onLoadConfig: (config: Configuration) => void;
  onDeleteConfig: (id: string) => void;
  isAuthenticated?: boolean;
  onSelectionChange?: (configs: Configuration[]) => void;
}

export function ConfigurationComparison({
  configurations,
  loading,
  currentConfig,
  onAddCurrent,
  onLoadConfig,
  onDeleteConfig,
  isAuthenticated = false,
  onSelectionChange,
}: ConfigurationComparisonProps) {
  const [selectedConfigs, setSelectedConfigs] = useState<Configuration[]>([]);

  const addConfiguration = (config: Configuration) => {
    if (selectedConfigs.length >= 4) {
      return; // Maximum 4 configurations for comparison
    }
    if (!selectedConfigs.find(c => c.id === config.id)) {
      const newConfigs = [...selectedConfigs, config];
      setSelectedConfigs(newConfigs);
      onSelectionChange?.(newConfigs);
    }
  };

  const removeConfiguration = (id: string) => {
    const newConfigs = selectedConfigs.filter(c => c.id !== id);
    setSelectedConfigs(newConfigs);
    onSelectionChange?.(newConfigs);
  };

  const clearAll = () => {
    setSelectedConfigs([]);
    onSelectionChange?.([]);
  };

  // Prepare data for charts
  const prepareBarChartData = () => {
    if (selectedConfigs.length === 0) return [];
    
    const metrics = ['Ex', 'Ey', 'Gxy', 'Thickness', 'Weight', 'Plies'];
    
    return metrics.map(metric => {
      const dataPoint: any = { name: metric };
      
      selectedConfigs.forEach((config, index) => {
        const configName = `Config ${index + 1}`;
        
        if (metric === 'Ex' && config.engineering_properties) {
          dataPoint[configName] = config.engineering_properties.Ex;
        } else if (metric === 'Ey' && config.engineering_properties) {
          dataPoint[configName] = config.engineering_properties.Ey;
        } else if (metric === 'Gxy' && config.engineering_properties) {
          dataPoint[configName] = config.engineering_properties.Gxy;
        } else if (metric === 'Thickness' && config.total_thickness) {
          dataPoint[configName] = config.total_thickness * 1000; // Scale for visibility
        } else if (metric === 'Weight' && config.total_weight) {
          dataPoint[configName] = config.total_weight;
        } else if (metric === 'Plies') {
          dataPoint[configName] = config.plies.length * 1000; // Scale for visibility
        }
      });
      
      return dataPoint;
    });
  };

  const prepareRadarChartData = () => {
    if (selectedConfigs.length === 0 || !selectedConfigs.every(c => c.engineering_properties)) return [];
    
    // Normalize all values to 0-100 scale for radar chart
    const allEx = selectedConfigs.map(c => c.engineering_properties!.Ex);
    const allEy = selectedConfigs.map(c => c.engineering_properties!.Ey);
    const allGxy = selectedConfigs.map(c => c.engineering_properties!.Gxy);
    const allNuxy = selectedConfigs.map(c => c.engineering_properties!.nuxy);
    const allThickness = selectedConfigs.filter(c => c.total_thickness).map(c => c.total_thickness!);
    const allWeight = selectedConfigs.filter(c => c.total_weight).map(c => c.total_weight!);
    
    const normalize = (value: number, min: number, max: number) => {
      if (max === min) return 50;
      return ((value - min) / (max - min)) * 100;
    };
    
    return selectedConfigs.map((config, index) => ({
      name: config.name.substring(0, 15) + (config.name.length > 15 ? '...' : ''),
      Ex: config.engineering_properties ? normalize(config.engineering_properties.Ex, Math.min(...allEx), Math.max(...allEx)) : 0,
      Ey: config.engineering_properties ? normalize(config.engineering_properties.Ey, Math.min(...allEy), Math.max(...allEy)) : 0,
      Gxy: config.engineering_properties ? normalize(config.engineering_properties.Gxy, Math.min(...allGxy), Math.max(...allGxy)) : 0,
      'νxy': config.engineering_properties ? normalize(config.engineering_properties.nuxy, Math.min(...allNuxy), Math.max(...allNuxy)) : 0,
      Thickness: config.total_thickness && allThickness.length > 0 ? normalize(config.total_thickness, Math.min(...allThickness), Math.max(...allThickness)) : 0,
      Weight: config.total_weight && allWeight.length > 0 ? normalize(config.total_weight, Math.min(...allWeight), Math.max(...allWeight)) : 0,
    }));
  };

  const chartColors = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-6">
      {/* Comparison View */}
      {selectedConfigs.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Configuration Comparison ({selectedConfigs.length} selected)
              </h3>
            </div>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          <Tabs defaultValue="cards" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="cards">Side-by-Side</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
              <TabsTrigger value="radar">Radar Chart</TabsTrigger>
            </TabsList>

            <TabsContent value="cards" className="mt-0">
              <div className="overflow-x-auto">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedConfigs.length}, minmax(250px, 1fr))` }}>
                  {selectedConfigs.map((config) => (
                    <Card key={config.id} className="p-4 relative hover-scale">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => removeConfiguration(config.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <h4 className="font-semibold text-foreground mb-4 pr-8">{config.name}</h4>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center pb-2 border-b border-border">
                          <span className="text-muted-foreground">Plies</span>
                          <span className="font-medium text-foreground">{config.plies.length}</span>
                        </div>

                        {config.total_thickness && (
                          <div className="flex justify-between items-center pb-2 border-b border-border">
                            <span className="text-muted-foreground">Thickness</span>
                            <span className="font-medium text-foreground">{config.total_thickness.toFixed(2)} mm</span>
                          </div>
                        )}

                        {config.total_weight && (
                          <div className="flex justify-between items-center pb-2 border-b border-border">
                            <span className="text-muted-foreground">Weight</span>
                            <span className="font-medium text-foreground">{config.total_weight.toFixed(2)} g</span>
                          </div>
                        )}

                        {config.engineering_properties && (
                          <>
                            <div className="flex justify-between items-center pb-2 border-b border-border">
                              <span className="text-muted-foreground">Ex</span>
                              <span className="font-medium text-foreground">{config.engineering_properties.Ex.toFixed(0)} MPa</span>
                            </div>

                            <div className="flex justify-between items-center pb-2 border-b border-border">
                              <span className="text-muted-foreground">Ey</span>
                              <span className="font-medium text-foreground">{config.engineering_properties.Ey.toFixed(0)} MPa</span>
                            </div>

                            <div className="flex justify-between items-center pb-2 border-b border-border">
                              <span className="text-muted-foreground">Gxy</span>
                              <span className="font-medium text-foreground">{config.engineering_properties.Gxy.toFixed(0)} MPa</span>
                            </div>

                            <div className="flex justify-between items-center pb-2 border-b border-border">
                              <span className="text-muted-foreground">νxy</span>
                              <span className="font-medium text-foreground">{config.engineering_properties.nuxy.toFixed(3)}</span>
                            </div>
                          </>
                        )}

                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground mb-2">Stacking:</p>
                          <p className="text-xs font-mono text-foreground break-all">
                            [{config.plies.map(p => `${p.angle}°`).join('/')}]
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Difference Highlights */}
              {selectedConfigs.length >= 2 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-3">Key Differences</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Ply Count Range</div>
                      <div className="font-medium text-foreground">
                        {Math.min(...selectedConfigs.map(c => c.plies.length))} - {Math.max(...selectedConfigs.map(c => c.plies.length))}
                      </div>
                    </div>
                    {selectedConfigs.every(c => c.total_thickness) && (
                      <div>
                        <div className="text-muted-foreground text-xs">Thickness Range (mm)</div>
                        <div className="font-medium text-foreground">
                          {Math.min(...selectedConfigs.map(c => c.total_thickness!)).toFixed(2)} - {Math.max(...selectedConfigs.map(c => c.total_thickness!)).toFixed(2)}
                        </div>
                      </div>
                    )}
                    {selectedConfigs.every(c => c.engineering_properties) && (
                      <>
                        <div>
                          <div className="text-muted-foreground text-xs">Ex Range (MPa)</div>
                          <div className="font-medium text-foreground">
                            {Math.min(...selectedConfigs.map(c => c.engineering_properties!.Ex)).toFixed(0)} - {Math.max(...selectedConfigs.map(c => c.engineering_properties!.Ex)).toFixed(0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">Ey Range (MPa)</div>
                          <div className="font-medium text-foreground">
                            {Math.min(...selectedConfigs.map(c => c.engineering_properties!.Ey)).toFixed(0)} - {Math.max(...selectedConfigs.map(c => c.engineering_properties!.Ey)).toFixed(0)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bar" className="mt-0">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Engineering Properties Comparison</h4>
                </div>
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareBarChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--foreground))"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <YAxis 
                        stroke="hsl(var(--foreground))"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      {selectedConfigs.map((config, index) => (
                        <Bar 
                          key={config.id} 
                          dataKey={`Config ${index + 1}`} 
                          fill={chartColors[index % chartColors.length]}
                          name={config.name}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  * Thickness and Ply count values are scaled for visualization purposes
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="radar" className="mt-0">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Performance Spider Chart (Normalized)</h4>
                </div>
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={prepareRadarChartData()}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis 
                        dataKey="name" 
                        tick={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Radar name="Ex" dataKey="Ex" stroke={chartColors[0]} fill={chartColors[0]} fillOpacity={0.3} />
                      <Radar name="Ey" dataKey="Ey" stroke={chartColors[1]} fill={chartColors[1]} fillOpacity={0.3} />
                      <Radar name="Gxy" dataKey="Gxy" stroke={chartColors[2]} fill={chartColors[2]} fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  * All values normalized to 0-100 scale for comparison. Higher values indicate better performance in that metric.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      )}

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

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addConfiguration(config)}
                    disabled={selectedConfigs.some(c => c.id === config.id) || selectedConfigs.length >= 4}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {selectedConfigs.some(c => c.id === config.id) ? 'Added' : 'Compare'}
                  </Button>
                  
                  <ConfigurationActions
                    config={config}
                    onLoad={onLoadConfig}
                    onDelete={onDeleteConfig}
                  />
                </div>

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
