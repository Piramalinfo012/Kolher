import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: finishes } = await supabase.from('finishes').select('*');
    const { data: handles } = await supabase.from('handles').select('*');
    console.log('Finishes count:', finishes?.length);
    console.log('Handles count:', handles?.length);
}

run();
