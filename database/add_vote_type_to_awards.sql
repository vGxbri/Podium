-- Add vote_type enum and column to awards table

-- 1. Create the enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vote_type') THEN
        CREATE TYPE public.vote_type AS ENUM ('person', 'photo', 'video', 'audio', 'text');
    END IF;
END $$;

-- 2. Add the column to the table
ALTER TABLE public.awards 
ADD COLUMN IF NOT EXISTS vote_type public.vote_type DEFAULT 'person' NOT NULL;
