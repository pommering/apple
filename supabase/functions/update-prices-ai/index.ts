import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Product {
  name: string;
  cost_price: number;
  margin_percentage: number;
}

interface ParsedProduct {
  name: string;
  cost_price: number;
  sale_price: number;
  margin_percentage: number;
  margin_value: number;
  freight: number;
  category: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text input is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse the text input to extract products and prices
    const products = parseProductText(text);

    if (products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid products found in text' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get existing products
    const { data: existingProducts } = await supabase
      .from('products')
      .select('*');

    const updates = [];
    const inserts = [];

    for (const product of products) {
      const existing = existingProducts?.find(
        (p) => normalizeProductName(p.name) === normalizeProductName(product.name)
      );

      if (existing) {
        // Update existing product
        updates.push({
          id: existing.id,
          ...product,
          updated_at: new Date().toISOString(),
        });
      } else {
        // Insert new product
        inserts.push(product);
      }
    }

    // Perform updates
    for (const update of updates) {
      await supabase
        .from('products')
        .update(update)
        .eq('id', update.id);
    }

    // Perform inserts
    if (inserts.length > 0) {
      await supabase.from('products').insert(inserts);
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated: updates.length,
        inserted: inserts.length,
        message: `Updated ${updates.length} products and added ${inserts.length} new products`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing products:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function parseProductText(text: string): ParsedProduct[] {
  const products: ParsedProduct[] = [];
  const lines = text.split('\n').filter((line) => line.trim());

  for (const line of lines) {
    // Try to extract product name and price
    // Format examples:
    // iPhone 16 • 256GB → R$ 3.500,00
    // iPhone 16 Pro • 256GB - 6350
    // Watch 10 • 46mm: 2100

    const patterns = [
      /(.+?)(?:→|->|:|-|=)\s*R?\$?\s*([\d.,]+)/i,
      /(.+?)\s+([\d.,]+)$/,
    ];

    let match = null;
    for (const pattern of patterns) {
      match = line.match(pattern);
      if (match) break;
    }

    if (match) {
      const name = match[1].trim().replace(/[•]/g, '•');
      const priceStr = match[2].replace(/[^\d,]/g, '').replace(',', '.');
      const price = parseFloat(priceStr);

      if (name && !isNaN(price) && price > 0) {
        const category = detectCategory(name);
        const marginPercentage = getDefaultMargin(category);
        const salePrice = price * (1 + marginPercentage / 100);
        const marginValue = salePrice - price;

        products.push({
          name,
          cost_price: price,
          sale_price: Math.round(salePrice * 100) / 100,
          margin_percentage: marginPercentage,
          margin_value: Math.round(marginValue * 100) / 100,
          freight: 50.00,
          category,
        });
      }
    }
  }

  return products;
}

function detectCategory(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('iphone')) return 'iPhone';
  if (lowerName.includes('watch')) return 'Watch';
  if (lowerName.includes('airpods')) return 'AirPods';
  if (lowerName.includes('ipad')) return 'iPad';
  if (lowerName.includes('macbook') || lowerName.includes('mac ')) return 'Mac';
  if (lowerName.includes('ultra')) return 'Ultra';
  return 'Other';
}

function getDefaultMargin(category: string): number {
  switch (category) {
    case 'iPhone':
      return 10;
    case 'Watch':
      return 15;
    case 'AirPods':
      return 15;
    case 'Ultra':
      return 15;
    default:
      return 10;
  }
}

function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[•→\s-]/g, '')
    .trim();
}