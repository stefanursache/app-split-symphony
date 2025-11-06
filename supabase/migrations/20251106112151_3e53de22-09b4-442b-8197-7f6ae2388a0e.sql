-- Create laminate_configurations table
CREATE TABLE public.laminate_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  plies JSONB NOT NULL,
  engineering_properties JSONB,
  total_thickness REAL,
  total_weight REAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.laminate_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Anyone can view configurations" 
ON public.laminate_configurations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create configurations" 
ON public.laminate_configurations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update configurations" 
ON public.laminate_configurations 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete configurations" 
ON public.laminate_configurations 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_laminate_configurations_updated_at
BEFORE UPDATE ON public.laminate_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();