import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Edit, FilePlus } from 'lucide-react';

interface SaveConfigurationDialogProps {
  onSave: (name: string, description: string) => void;
  onNewConfig?: () => void;
  disabled?: boolean;
  isUpdate?: boolean;
  requiresAuth?: boolean;
}

export function SaveConfigurationDialog({ onSave, onNewConfig, disabled, isUpdate = false, requiresAuth = false }: SaveConfigurationDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave(name, description);
    setName('');
    setDescription('');
    setOpen(false);
  };

  return (
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            disabled={disabled || requiresAuth} 
            className="gap-2 flex-1"
            title={requiresAuth ? "Sign in to save configurations" : undefined}
          >
            {isUpdate ? <Edit className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {isUpdate ? 'Update' : 'Save'} Configuration
          </Button>
        </DialogTrigger>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>{isUpdate ? 'Update' : 'Save'} Laminate Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Configuration Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Carbon/Glass Hybrid"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {isUpdate ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {onNewConfig && (
      <Button 
        variant="outline" 
        onClick={onNewConfig}
        className="gap-2"
        title="Start a new empty configuration"
      >
        <FilePlus className="h-4 w-4" />
        New
      </Button>
    )}
    </div>
  );
}
