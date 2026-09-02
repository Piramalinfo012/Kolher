import { createClient } from '@supabase/supabase-js';
import { INITIAL_PRODUCTS } from './src/config/demoData.ts';

const sb = createClient('https://cvqhnjnyslckhzsanfoz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2cWhuam55c2xja2h6c2FuZm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzE2NTgsImV4cCI6MjEwMzkwNzY1OH0.WWjmikUThey4pBDJltnDJtCikuBJZv1LqqZOKNrNXFk');

async function seed() {
  const { data, error } = await sb.from('products').upsert(INITIAL_PRODUCTS);
  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Inserted successfully!');
  }
}

seed();
