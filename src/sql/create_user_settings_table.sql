-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  column_visibility JSONB NOT NULL DEFAULT '{}'::jsonb,
  auto_status_time TEXT NOT NULL DEFAULT '09:00 AM',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(username)
);

-- Add RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy for selecting own settings
CREATE POLICY select_own_settings ON user_settings
  FOR SELECT USING (auth.uid() IS NOT NULL AND username = auth.jwt() ->> 'preferred_username');

-- Policy for inserting own settings
CREATE POLICY insert_own_settings ON user_settings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND username = auth.jwt() ->> 'preferred_username');

-- Policy for updating own settings
CREATE POLICY update_own_settings ON user_settings
  FOR UPDATE USING (auth.uid() IS NOT NULL AND username = auth.jwt() ->> 'preferred_username');
