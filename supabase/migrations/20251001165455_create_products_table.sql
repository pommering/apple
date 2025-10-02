/*
  # Create Products Table for Apple Price Management

  1. New Tables
    - `products`
      - `id` (uuid, primary key) - Unique identifier for each product
      - `name` (text) - Product name (e.g., "iPhone 16 • 256GB")
      - `cost_price` (decimal) - Purchase cost price (CUSTO)
      - `sale_price` (decimal) - Selling price (VALOR DE VENDA)
      - `margin_percentage` (integer) - Profit margin percentage (%)
      - `margin_value` (decimal) - Profit margin value (MARGEM)
      - `category` (text) - Product category (e.g., "iPhone", "Watch", "AirPods")
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `products` table
    - Add policy for anyone to read products (public access)
    - Add policy for authenticated users to manage products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cost_price decimal(10, 2) NOT NULL DEFAULT 0,
  sale_price decimal(10, 2) NOT NULL DEFAULT 0,
  margin_percentage integer NOT NULL DEFAULT 10,
  margin_value decimal(10, 2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);