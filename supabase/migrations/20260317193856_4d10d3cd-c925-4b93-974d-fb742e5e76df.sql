
-- Fix the permissive contact messages policy - require at least name and email
DROP POLICY "Anyone can send contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can send contact messages" ON public.contact_messages 
  FOR INSERT 
  WITH CHECK (
    length(trim(name)) > 0 AND 
    length(trim(email)) > 0 AND 
    length(trim(message)) > 0
  );
