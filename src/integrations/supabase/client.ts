// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ejibzjmgjfzentnwcblm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaWJ6am1namZ6ZW50bndjYmxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzU2MTYsImV4cCI6MjA2NDAxMTYxNn0.Dv76lyQ4mIdYMri-PVESfhn_uU7T8NTcy2VdriLqWCk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);