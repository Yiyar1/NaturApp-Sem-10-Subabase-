import { createClient } from '@supabase/supabase-js';

// ============================================
// CLIENTE SUPABASE
// Conexión con la base de datos en la nube
// ============================================

const SUPABASE_URL = 'https://wmxzrzgbkvgmcrqcexie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndteHpyemdia3ZnbWNycWNleGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NTU0ODUsImV4cCI6MjA5NjMzMTQ4NX0.2ibpAj6VL-INhtVZzTv-DcApWKnVU91CNd6UQ-QeK9I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
