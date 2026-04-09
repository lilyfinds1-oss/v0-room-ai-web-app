-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  subscription_tier TEXT DEFAULT 'free', -- free, pro
  subscription_status TEXT DEFAULT 'active' -- active, canceled, past_due
);

-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  original_image_key TEXT NOT NULL, -- for Blob storage reference
  room_type TEXT NOT NULL, -- bedroom, living_room, kitchen, office
  budget_range TEXT NOT NULL, -- budget_0_5k, budget_5_10k, budget_10k_plus
  style_preference TEXT NOT NULL, -- modern, traditional, eclectic, minimalist, maximalist
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'processing', -- processing, completed, failed
  error_message TEXT
);

-- Create jobs table (Inngest workflow tracking)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  inngest_run_id TEXT UNIQUE,
  status TEXT DEFAULT 'queued', -- queued, running, completed, failed
  current_stage INT DEFAULT 0, -- 0-9 representing the pipeline stage
  stage_results JSONB DEFAULT '{}', -- stores output from each stage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Create designs table (final results)
CREATE TABLE IF NOT EXISTS designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  upload_id UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  variation_number INT NOT NULL, -- 1, 2, 3 for free/pro
  design_image_url TEXT NOT NULL, -- final composited image URL
  design_image_key TEXT NOT NULL, -- for Blob storage reference
  furniture_data JSONB NOT NULL, -- array of selected furniture items
  room_analysis JSONB NOT NULL, -- from stage 0
  placement_map JSONB NOT NULL, -- from stage 2
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create design_products table (linking designs to products)
CREATE TABLE IF NOT EXISTS design_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position_x FLOAT NOT NULL, -- relative to image
  position_y FLOAT NOT NULL,
  scale_factor FLOAT NOT NULL, -- depth-adjusted scale
  rotation_angle FLOAT DEFAULT 0
);

-- Create products table (furniture database)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- sofa, chair, table, lamp, cabinet, artwork, rug, plant, cushion
  style TEXT NOT NULL, -- modern, traditional, eclectic, minimalist, maximalist
  price_min INT NOT NULL, -- in cents
  price_max INT NOT NULL,
  dimensions_width FLOAT NOT NULL, -- inches
  dimensions_depth FLOAT NOT NULL,
  dimensions_height FLOAT NOT NULL,
  image_url TEXT NOT NULL,
  color TEXT NOT NULL,
  material TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_upload_id ON jobs(upload_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_job_id ON designs(job_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_style ON products(style);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for uploads
CREATE POLICY "Users can view own uploads"
  ON uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads"
  ON uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for jobs
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for designs
CREATE POLICY "Users can view own designs"
  ON designs FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for design_products
CREATE POLICY "Users can view own design products"
  ON design_products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM designs d
      WHERE d.id = design_products.design_id
      AND d.user_id = auth.uid()
    )
  );

-- RLS Policies for products (everyone can view)
CREATE POLICY "Everyone can view products"
  ON products FOR SELECT
  USING (true);
