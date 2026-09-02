import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function scrape() {
  const url = 'https://fimacf.com/en/tipologia/bath_en/exposed-bath-mixer_en/';
  console.log(`Fetching ${url}...`);
  
  const res = await fetch(url);
  const html = await res.text();
  
  const $ = cheerio.load(html);
  
  const products = [];
  
  // Find all product list items
  $('li.product').each((i, el) => {
    // Fima uses specific structure
    const titleEl = $(el).find('.woocommerce-loop-product__title');
    const name = titleEl.text().trim();
    
    // Series/Model might be in `.product-item-serie` or similar
    const serieEl = $(el).find('.product-item-serie');
    const model_number = serieEl.text().trim() || `FIMA-EXP-${i+1}`;
    
    // Find image
    const imgEl = $(el).find('img.attachment-woocommerce_thumbnail');
    let imgUrl = imgEl.attr('src');
    if (!imgUrl) {
        imgUrl = $(el).find('img').first().attr('src');
    }
    
    if (name && imgUrl) {
      // In case srcset is present, just take src
      products.push({
        name,
        model_number,
        imgUrl
      });
    }
  });
  
  console.log(`Found ${products.length} products.`);
  
  const productsDir = path.join(__dirname, 'public', 'products');
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
  }
  
  const productEntries = [];
  
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`Processing: ${p.name}`);
    
    // Download image
    try {
      const ext = path.extname(p.imgUrl.split('?')[0]) || '.jpg';
      // Clean filename
      const safeName = p.model_number.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_' + i;
      const fileName = `${safeName}${ext}`;
      const filePath = path.join(productsDir, fileName);
      
      const imgRes = await fetch(p.imgUrl);
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      fs.writeFileSync(filePath, buffer);
      
      productEntries.push(`
  {
    product_id: 'PRD_${safeName.toUpperCase()}',
    category: 'Exposed Bath Mixer',
    product_name: '${p.name.replace(/'/g, "\\'")}',
    model_number: '${p.model_number}',
    description: '${p.name.replace(/'/g, "\\'")} from FIMA Carlo Frattini.',
    base_price: ${Math.floor(Math.random() * 10 + 15) * 1000},
    gst_percentage: 18,
    hsn_code: '84818020',
    unit: 'PCS',
    main_image_url: '/products/${fileName}',
    status: 'ACTIVE',
    customizable: 'YES',
    image_mode: 'COMBINATION_IMAGE',
    created_at: '2026-09-02 10:00:00',
    updated_at: '2026-09-02 10:00:00'
  }`);
    } catch (e) {
      console.error(`Failed to download image for ${p.name}:`, e);
    }
  }
  
  const code = `export const INITIAL_PRODUCTS: Product[] = [${productEntries.join(',')}
];`;

  fs.writeFileSync('scraped_products.ts', code);
  console.log('Successfully generated scraped_products.ts');
}

scrape().catch(console.error);
