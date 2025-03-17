-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_projects table
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL REFERENCES users(username),
  name TEXT NOT NULL,
  logo TEXT,
  link TEXT,
  twitter_link TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  chain TEXT,
  stage TEXT,
  tags JSONB,
  type TEXT,
  cost NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
CREATE INDEX IF NOT EXISTS idx_user_projects_username ON user_projects(username);
CREATE INDEX IF NOT EXISTS idx_user_airdrops_username ON user_airdrops(username);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_airdrops ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_projects
CREATE POLICY user_projects_select_policy ON user_projects 
  FOR SELECT USING (username = current_setting('app.current_username', true));

CREATE POLICY user_projects_insert_policy ON user_projects 
  FOR INSERT WITH CHECK (username = current_setting('app.current_username', true));

CREATE POLICY user_projects_update_policy ON user_projects 
  FOR UPDATE USING (username = current_setting('app.current_username', true));

CREATE POLICY user_projects_delete_policy ON user_projects 
  FOR DELETE USING (username = current_setting('app.current_username', true));

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
