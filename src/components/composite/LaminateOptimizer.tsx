import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, TrendingDown, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Ply, Material } from '@/types/materials';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OptimizationSuggestion {
  name: string;
  plies: Ply[];
  expectedWeight?: number;
  strengthRating?: string;
  rationale: string;
  tradeoffs?: string;
}

interface LaminateOptimizerProps {
  currentPlies: Ply[];
  materials: Record<string, Material>;
  onApplySuggestion: (plies: Ply[]) => void;
}

export function LaminateOptimizer({
  currentPlies,
  materials,
  onApplySuggestion,
}: LaminateOptimizerProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loadType, setLoadType] = useState('compression');
  const [minStrength, setMinStrength] = useState('');
  const [maxWeight, setMaxWeight] = useState('');

  const handleOptimize = async () => {
    if (currentPlies.length === 0) {
      toast.error('Please add at least one ply to optimize');
      return;
    }

    setLoading(true);
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke('optimize-laminate', {
        body: {
          currentPlies,
          requirements: {
            loadType,
            minStrength: minStrength ? Number(minStrength) : undefined,
            maxWeight: maxWeight ? Number(maxWeight) : undefined,
          },
          availableMaterials: Object.keys(materials),
        },
      });

      if (error) {
        if (error.message.includes('Rate limit')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (error.message.includes('Payment required')) {
          toast.error('AI credits depleted. Please add credits to continue.');
        } else {
          toast.error('Failed to generate optimizations');
        }
        console.error('Optimization error:', error);
        return;
      }

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        toast.success(`Generated ${data.suggestions.length} optimization suggestions`);
      }
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Failed to generate optimizations');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (rating?: string) => {
    switch (rating) {
      case 'very high':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'high':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">AI-Powered Optimization</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="loadType">Primary Load Type</Label>
            <Select value={loadType} onValueChange={setLoadType}>
              <SelectTrigger id="loadType" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compression">Axial Compression</SelectItem>
                <SelectItem value="tension">Axial Tension</SelectItem>
                <SelectItem value="bending">Bending</SelectItem>
                <SelectItem value="torsion">Torsion</SelectItem>
                <SelectItem value="combined">Combined Loading</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minStrength">Min Strength (MPa)</Label>
              <Input
                id="minStrength"
                type="number"
                placeholder="Optional"
                value={minStrength}
                onChange={(e) => setMinStrength(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="maxWeight">Max Weight (g)</Label>
              <Input
                id="maxWeight"
                type="number"
                placeholder="Optional"
                value={maxWeight}
                onChange={(e) => setMaxWeight(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            onClick={handleOptimize}
            disabled={loading || currentPlies.length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Optimizations...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Optimize Design
              </>
            )}
          </Button>
        </div>
      </Card>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">
            AI Suggestions ({suggestions.length})
          </h4>
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="p-6 border-primary/20">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground text-lg">
                      {suggestion.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      {suggestion.strengthRating && (
                        <Badge className={getStrengthColor(suggestion.strengthRating)}>
                          <Zap className="h-3 w-3 mr-1" />
                          {suggestion.strengthRating} strength
                        </Badge>
                      )}
                      {suggestion.expectedWeight && (
                        <Badge variant="outline">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          ~{suggestion.expectedWeight.toFixed(1)}g
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => onApplySuggestion(suggestion.plies)}
                    variant="outline"
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground mb-2">Ply Stack:</p>
                  <div className="space-y-1">
                    {suggestion.plies.map((ply, i) => (
                      <div
                        key={i}
                        className="text-xs text-muted-foreground flex items-center gap-2"
                      >
                        <span className="font-mono">Ply {i + 1}:</span>
                        <span>{ply.material}</span>
                        <span className="text-primary">@ {ply.angle}°</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Rationale:</p>
                    <p className="text-sm text-muted-foreground">{suggestion.rationale}</p>
                  </div>
                  {suggestion.tradeoffs && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Trade-offs:</p>
                      <p className="text-sm text-muted-foreground">{suggestion.tradeoffs}</p>
                    </div>
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
