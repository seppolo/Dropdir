-- Create user_airdrops table
CREATE TABLE IF NOT EXISTS user_airdrops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL REFERENCES users(username),
  project TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  link TEXT,
  twitter TEXT,
  notes TEXT,
  chain TEXT,
  stage TEXT,
  type TEXT,
  cost NUMERIC(10, 2) DEFAULT 0,
  tags TEXT,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  image TEXT,
  logo TEXT,
  is_active BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_airdrops_username ON user_airdrops(username);

-- Enable Row Level Security
ALTER TABLE user_airdrops ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_airdrops
CREATE POLICY user_airdrops_select_policy ON user_airdrops 
  FOR SELECT USING (username = current_setting('app.current_username', true));

CREATE POLICY user_airdrops_insert_policy ON user_airdrops 
  FOR INSERT WITH CHECK (username = current_setting('app.current_username', true));

CREATE POLICY user_airdrops_update_policy ON user_airdrops 
  FOR UPDATE USING (username = current_setting('app.current_username', true));

CREATE POLICY user_airdrops_delete_policy ON user_airdrops 
  FOR DELETE USING (username = current_setting('app.current_username', true));

-- Create policy for public access to public airdrops
CREATE POLICY user_airdrops_public_select_policy ON user_airdrops 
  FOR SELECT USING (is_public = true);
