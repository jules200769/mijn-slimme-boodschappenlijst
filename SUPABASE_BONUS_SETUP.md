# Supabase Bonus Products Setup

## Database Schema

```sql
-- Create bonus_products table
CREATE TABLE IF NOT EXISTS public.bonus_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    discount DECIMAL(10,2),
    discount_percentage INTEGER,
    bonus_description TEXT,
    store TEXT NOT NULL DEFAULT 'Albert Heijn',
    week TEXT,
    category TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint
ALTER TABLE public.bonus_products 
ADD CONSTRAINT unique_user_product_week 
UNIQUE (user_id, name, week);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bonus_products_user_id ON public.bonus_products(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_products_name ON public.bonus_products(name);
CREATE INDEX IF NOT EXISTS idx_bonus_products_week ON public.bonus_products(week);
CREATE INDEX IF NOT EXISTS idx_bonus_products_category ON public.bonus_products(category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bonus_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own bonus products" ON public.bonus_products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bonus products" ON public.bonus_products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bonus products" ON public.bonus_products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bonus products" ON public.bonus_products
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bonus_products_updated_at 
    BEFORE UPDATE ON public.bonus_products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## Usage

1. Copy the SQL code above
2. Go to your Supabase dashboard
3. Navigate to the SQL Editor
4. Paste the SQL code and run it
5. The bonus_products table will be created with all necessary constraints and policies
