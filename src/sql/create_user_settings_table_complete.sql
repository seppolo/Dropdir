-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  columnVisibility JSONB NOT NULL DEFAULT '{}'::jsonb,
  autoStatusTime TEXT NOT NULL DEFAULT '09:00 AM',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(username)
);

-- Add comment to the table
COMMENT ON TABLE user_settings IS 'Stores user preferences for column visibility and auto-activation settings';

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS user_settings_username_idx ON user_settings(username);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see and modify their own settings
CREATE POLICY user_settings_policy ON user_settings 
  USING (username = current_user OR username = auth.uid())
  WITH CHECK (username = current_user OR username = auth.uid());
