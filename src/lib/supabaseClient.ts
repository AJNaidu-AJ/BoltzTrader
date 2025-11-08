import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://qmwyanlkaafeetqkthzm.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtd3lhbmxrYWFmZWV0cWt0aHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDMyNzksImV4cCI6MjA3NzQxOTI3OX0.IynEM2m8qXDTOFhQ2MpDsDmA7z34IxvjI4N-eNQP5RE'
);