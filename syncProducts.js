import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const f5801 = {
    product_id: 'PRD_SLIDE',
    category: 'Miscelatore lavabo',
    product_name: 'SLIDE Miscelatore lavabo',
    model_number: 'F5801',
    description: 'Italian architectural single-control deck-mount lavatory basin mixer featuring clean cylindrical geometry, forward blade spout, and interchangeable precision-crafted marble, wood, and resin rotary handles (Manopola F1420).',
    base_price: 28500,
    gst_percentage: 18,
    hsn_code: '84818020',
    unit: 'PCS',
    main_image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    customizable: 'YES',
    image_mode: 'COMBINATION_IMAGE',
    created_at: '2026-08-01 10:00:00',
    updated_at: '2026-08-25 15:30:00',
    created_by: 'Rajeev Sharma'
};

async function run() {
    const { data, error } = await supabase.from('products').upsert(f5801);
    if (error) console.error('Error:', error);
    else console.log('Successfully added F5801:', data);
}

run();
