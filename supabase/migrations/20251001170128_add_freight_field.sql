/*
  # Add freight field to products table

  1. Changes
    - Add `freight` column to products table (decimal, default 50.00)
    - This represents the shipping cost per product

  2. Notes
    - Default freight value set to R$ 50.00
    - Can be customized per product
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'freight'
  ) THEN
    ALTER TABLE products ADD COLUMN freight decimal(10, 2) DEFAULT 50.00 NOT NULL;
  END IF;
END $$;