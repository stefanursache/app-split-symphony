import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Configuration } from '@/hooks/useConfigurations';
import { Skeleton } from '@/components/ui/skeleton';

interface ConfigurationSelectorProps {
  configurations: Configuration[];
  loading: boolean;
  onSelect: (config: Configuration) => void;
  selectedIds: string[];
}

export function ConfigurationSelector({
  configurations,
  loading,
  onSelect,
  selectedIds,
}: ConfigurationSelectorProps) {
  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const availableConfigs = configurations.filter(c => !selectedIds.includes(c.id));

  return (
    <Select
      onValueChange={(value) => {
        const config = configurations.find(c => c.id === value);
        if (config) onSelect(config);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a configuration to add..." />
      </SelectTrigger>
      <SelectContent>
        {availableConfigs.length === 0 ? (
          <SelectItem value="none" disabled>
            No configurations available
          </SelectItem>
        ) : (
          availableConfigs.map((config) => (
            <SelectItem key={config.id} value={config.id}>
              {config.name} ({config.plies.length} plies)
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
