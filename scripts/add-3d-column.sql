-- Add model_3d_url column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS model_3d_url TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_model_3d_url ON products(model_3d_url) WHERE model_3d_url IS NOT NULL;