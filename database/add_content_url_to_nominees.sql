-- Add content_url column to nominees table to support media uploads (photos, videos, etc.)
ALTER TABLE public.nominees 
ADD COLUMN IF NOT EXISTS content_url TEXT;

-- We don't need to change user_id constraint yet, assuming each photo is associated with a group member (the "nominee").
