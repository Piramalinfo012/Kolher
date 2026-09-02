import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const query = `
    CREATE TABLE IF NOT EXISTS product_spare_parts (
        part_id TEXT PRIMARY KEY,
        product_id TEXT REFERENCES products(product_id) ON DELETE CASCADE,
        part_name TEXT NOT NULL,
        part_model TEXT,
        price NUMERIC NOT NULL DEFAULT 0,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TEXT NOT NULL DEFAULT NOW()::TEXT,
        updated_at TEXT NOT NULL DEFAULT NOW()::TEXT
    );
    `;
    // We cannot run raw DDL queries via Supabase JS client usually.
    // Instead we can rely on the localStorage fallback for now if Supabase doesn't have it, or use supabase SQL API.
    // Actually, I can insert a mock record to see if it works. If it fails, I know the table doesn't exist.
    const { error } = await supabase.from('product_spare_parts').select('*').limit(1);
    console.log('Error checking table:', error);
}

run();
