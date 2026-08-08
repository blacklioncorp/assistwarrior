const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fltidvkbnkyfwhiyjtlm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsdGlkdmtibmt5ZndoaXlqdGxtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA4NDIxMywiZXhwIjoyMDk1NjYwMjEzfQ.APcwgFaMOLcDnNUWmndQOQeIkNioIimPoKQlTd2v7Ik');

async function checkAppointments() {
  const { data, error } = await supabase.from('appointments').select('*').eq('professional_id', 'b762ff55-a49e-4482-9a54-34efed5f4651');
  console.log('Appointments for Saul Goodman:', data);
}
checkAppointments();
