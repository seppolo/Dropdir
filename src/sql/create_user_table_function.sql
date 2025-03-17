-- Function to create a user-specific projects table
CREATE OR REPLACE FUNCTION create_user_table(table_name text)
RETURNS void AS $$
BEGIN
  -- Create the user-specific projects table
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL,
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
  )', table_name);
  
  -- Create index on username
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_username ON %I(username)', table_name, table_name);
  
  -- Enable RLS on the table
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  
  -- Create RLS policy to ensure users can only access their own data
  EXECUTE format('CREATE POLICY %I_user_policy ON %I 
    FOR ALL USING (username = current_setting(''app.current_username'', true))', 
    table_name, table_name);
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set claims for RLS
CREATE OR REPLACE FUNCTION set_claim(uid uuid, claim text, value text)
RETURNS text AS $$
BEGIN
  -- Set the claim value in the current session
  PERFORM set_config('app.current_' || claim, value, false);
  RETURN value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
