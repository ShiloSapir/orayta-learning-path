-- Create saved_sources table for explicitly saved sources
CREATE TABLE public.saved_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_id UUID,
  source_title TEXT NOT NULL,
  source_title_he TEXT,
  source_excerpt TEXT,
  source_excerpt_he TEXT,
  sefaria_link TEXT,
  topic_selected TEXT NOT NULL,
  time_selected INTEGER NOT NULL,
  is_saved BOOLEAN NOT NULL DEFAULT true,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_sources ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_sources
CREATE POLICY "Users can manage their own saved sources" 
ON public.saved_sources 
FOR ALL 
USING ((auth.uid())::text = (user_id)::text);

-- Add trigger for updated_at
CREATE TRIGGER update_saved_sources_updated_at
BEFORE UPDATE ON public.saved_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Clean up existing learning_sessions that might have been created just for viewing
-- Only keep sessions that have explicit status or reflections
DELETE FROM public.learning_sessions 
WHERE status = 'recommended' 
  AND id NOT IN (
    SELECT DISTINCT session_id 
    FROM public.reflections 
    WHERE session_id IS NOT NULL
  );