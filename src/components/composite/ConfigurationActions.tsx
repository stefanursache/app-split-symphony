import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, Trash2 } from 'lucide-react';
import { Configuration } from '@/hooks/useConfigurations';

interface ConfigurationActionsProps {
  config: Configuration;
  onLoad: (config: Configuration) => void;
  onDelete: (id: string) => void;
}

export function ConfigurationActions({ config, onLoad, onDelete }: ConfigurationActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleLoad = () => {
    onLoad(config);
  };

  const handleDeleteConfirm = () => {
    onDelete(config.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={handleLoad}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          Load
        </Button>
        <Button
          onClick={() => setShowDeleteDialog(true)}
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{config.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
