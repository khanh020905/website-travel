-- Add profile info columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_address TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS detailed_address TEXT DEFAULT '';
