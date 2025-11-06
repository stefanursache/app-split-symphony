import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ply, EngineeringProperties } from '@/types/materials';
import { toast } from 'sonner';

export interface Configuration {
  id: string;
  name: string;
  description: string | null;
  plies: Ply[];
  engineering_properties: EngineeringProperties | null;
  total_thickness: number | null;
  total_weight: number | null;
  created_at: string;
  updated_at: string;
}

export function useConfigurations() {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('laminate_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigurations((data as unknown as Configuration[]) || []);
    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast.error('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async (
    name: string,
    description: string,
    plies: Ply[],
    engineeringProps: EngineeringProperties,
    totalThickness: number,
    totalWeight: number
  ) => {
    try {
      const { error } = await supabase
        .from('laminate_configurations')
        .insert([{
          name,
          description,
          plies: plies as any,
          engineering_properties: engineeringProps as any,
          total_thickness: totalThickness,
          total_weight: totalWeight,
        }]);

      if (error) throw error;
      
      toast.success('Configuration saved successfully');
      fetchConfigurations();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    }
  };

  const deleteConfiguration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('laminate_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Configuration deleted');
      fetchConfigurations();
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast.error('Failed to delete configuration');
    }
  };

  const updateConfiguration = async (
    id: string,
    name: string,
    description: string,
    plies: Ply[],
    engineeringProps: EngineeringProperties,
    totalThickness: number,
    totalWeight: number
  ) => {
    try {
      const { error } = await supabase
        .from('laminate_configurations')
        .update({
          name,
          description,
          plies: plies as any,
          engineering_properties: engineeringProps as any,
          total_thickness: totalThickness,
          total_weight: totalWeight,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Configuration updated successfully');
      fetchConfigurations();
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error('Failed to update configuration');
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  return {
    configurations,
    loading,
    saveConfiguration,
    updateConfiguration,
    deleteConfiguration,
    refetch: fetchConfigurations,
  };
}
