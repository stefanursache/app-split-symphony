import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Play, Edit2 } from 'lucide-react';
import { LoadCase } from '@/hooks/useLoadCases';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface LoadCaseManagerProps {
  loadCases: LoadCase[];
  activeLoadCaseId: string;
  onSelectLoadCase: (id: string) => void;
  onAddLoadCase: (loadCase: Omit<LoadCase, 'id'>) => void;
  onDeleteLoadCase: (id: string) => void;
  onRunAnalysis: (loadCaseId: string) => void;
}

export function LoadCaseManager({
  loadCases,
  activeLoadCaseId,
  onSelectLoadCase,
  onAddLoadCase,
  onDeleteLoadCase,
  onRunAnalysis
}: LoadCaseManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLoadCase, setNewLoadCase] = useState({
    name: '',
    description: '',
    Nx: 0,
    Ny: 0,
    Nxy: 0,
    Mx: 0,
    My: 0,
    Mxy: 0
  });

  const handleAddLoadCase = () => {
    onAddLoadCase({
      name: newLoadCase.name,
      description: newLoadCase.description,
      loads: {
        Nx: newLoadCase.Nx,
        Ny: newLoadCase.Ny,
        Nxy: newLoadCase.Nxy,
        Mx: newLoadCase.Mx,
        My: newLoadCase.My,
        Mxy: newLoadCase.Mxy
      }
    });
    setNewLoadCase({
      name: '',
      description: '',
      Nx: 0,
      Ny: 0,
      Nxy: 0,
      Mx: 0,
      My: 0,
      Mxy: 0
    });
    setIsDialogOpen(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Load Cases</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Load Case
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Load Case</DialogTitle>
              <DialogDescription>
                Define a new loading scenario for analysis
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newLoadCase.name}
                  onChange={(e) => setNewLoadCase(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Maximum Operating Load"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newLoadCase.description}
                  onChange={(e) => setNewLoadCase(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this load case"
                  rows={2}
                />
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="Nx">Nx (N/mm)</Label>
                    <Input
                      id="Nx"
                      type="number"
                      value={newLoadCase.Nx}
                      onChange={(e) => setNewLoadCase(prev => ({ ...prev, Nx: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Ny">Ny (N/mm)</Label>
                    <Input
                      id="Ny"
                      type="number"
                      value={newLoadCase.Ny}
                      onChange={(e) => setNewLoadCase(prev => ({ ...prev, Ny: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Nxy">Nxy (N/mm)</Label>
                    <Input
                      id="Nxy"
                      type="number"
                      value={newLoadCase.Nxy}
                      onChange={(e) => setNewLoadCase(prev => ({ ...prev, Nxy: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="Mx">Mx (N)</Label>
                    <Input
                      id="Mx"
                      type="number"
                      value={newLoadCase.Mx}
                      onChange={(e) => setNewLoadCase(prev => ({ ...prev, Mx: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="My">My (N)</Label>
                    <Input
                      id="My"
                      type="number"
                      value={newLoadCase.My}
                      onChange={(e) => setNewLoadCase(prev => ({ ...prev, My: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Mxy">Mxy (N)</Label>
                    <Input
                      id="Mxy"
                      type="number"
                      value={newLoadCase.Mxy}
                      onChange={(e) => setNewLoadCase(prev => ({ ...prev, Mxy: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={handleAddLoadCase} className="w-full" disabled={!newLoadCase.name}>
                Create Load Case
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {loadCases.map((loadCase) => (
            <div
              key={loadCase.id}
              className={`p-3 rounded border transition-colors ${
                activeLoadCaseId === loadCase.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => onSelectLoadCase(loadCase.id)}>
                  <h4 className="font-medium text-foreground">{loadCase.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{loadCase.description}</p>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Nx:</span>
                      <span className="ml-1 font-mono text-foreground">{loadCase.loads.Nx} N/mm</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mx:</span>
                      <span className="ml-1 font-mono text-foreground">{loadCase.loads.Mx} N</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mxy:</span>
                      <span className="ml-1 font-mono text-foreground">{loadCase.loads.Mxy} N</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRunAnalysis(loadCase.id)}
                    title="Run Analysis"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteLoadCase(loadCase.id)}
                    title="Delete Load Case"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
              {loadCase.results && (
                <div className="mt-2 pt-2 border-t border-border">
                  <span className="text-xs text-green-600">✓ Analysis complete</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
