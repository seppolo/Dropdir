CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo TEXT,
  link TEXT,
  "twitterLink" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "lastActivity" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT DEFAULT '',
  "joinDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  chain TEXT,
  stage TEXT CHECK (stage IN ('Waitlist', 'Testnet', 'Early Access', 'Mainnet')),
  tags TEXT[] DEFAULT '{}',
  type TEXT CHECK (type IN ('Retroactive', 'Testnet', 'Mini App', 'Node')),
  cost NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create an index on the name column for faster searches
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);

-- Create an index on the isActive column for filtering
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects("isActive");

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
