-- Update existing bonus_products table to add bonus_description column
-- Run this in your Supabase SQL Editor if you already have the bonus_products table

-- Add the bonus_description column if it doesn't exist
ALTER TABLE public.bonus_products 
ADD COLUMN IF NOT EXISTS bonus_description TEXT;

-- Update the table structure to match the new schema
-- This will ensure all columns are properly defined
DO $$ 
BEGIN
    -- Check if the table exists and has the correct structure
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bonus_products') THEN
        -- Add any missing columns
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bonus_products' AND column_name = 'bonus_description') THEN
            ALTER TABLE public.bonus_products ADD COLUMN bonus_description TEXT;
        END IF;
        
        -- Ensure the unique constraint exists
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'unique_user_product_week') THEN
            ALTER TABLE public.bonus_products 
            ADD CONSTRAINT unique_user_product_week 
            UNIQUE (user_id, name, week);
        END IF;
        
        -- Create indexes if they don't exist
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_bonus_products_user_id') THEN
            CREATE INDEX idx_bonus_products_user_id ON public.bonus_products(user_id);
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_bonus_products_name') THEN
            CREATE INDEX idx_bonus_products_name ON public.bonus_products(name);
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_bonus_products_week') THEN
            CREATE INDEX idx_bonus_products_week ON public.bonus_products(week);
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_bonus_products_category') THEN
            CREATE INDEX idx_bonus_products_category ON public.bonus_products(category);
        END IF;
        
        RAISE NOTICE 'Bonus products table updated successfully';
    ELSE
        RAISE NOTICE 'Bonus products table does not exist. Please run the full setup script first.';
    END IF;
END $$;
