# Supabase Setup Commands

## Option 1: Using the Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `src/sql/setup_supabase_tables.sql`
5. Run the query

## Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db push -f src/sql/setup_supabase_tables.sql
```

## Option 3: Create Stored Procedures

You can create stored procedures in Supabase to make it easier to set up tables from your application:

```sql
-- Create a function to execute arbitrary SQL
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to set up the users table
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to set up the projects table
CREATE OR REPLACE FUNCTION create_projects_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS user_projects (
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
  );
  
  CREATE INDEX IF NOT EXISTS idx_user_projects_username ON user_projects(username);
  ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to set up RLS policies
CREATE OR REPLACE FUNCTION setup_rls_policies()
RETURNS void AS $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS user_projects_select_policy ON user_projects;
  DROP POLICY IF EXISTS user_projects_insert_policy ON user_projects;
  DROP POLICY IF EXISTS user_projects_update_policy ON user_projects;
  DROP POLICY IF EXISTS user_projects_delete_policy ON user_projects;
  
  -- Create new policies
  CREATE POLICY user_projects_select_policy ON user_projects 
    FOR SELECT USING (username = current_setting('app.current_username', true));
  
  CREATE POLICY user_projects_insert_policy ON user_projects 
    FOR INSERT WITH CHECK (username = current_setting('app.current_username', true));
  
  CREATE POLICY user_projects_update_policy ON user_projects 
    FOR UPDATE USING (username = current_setting('app.current_username', true));
  
  CREATE POLICY user_projects_delete_policy ON user_projects 
    FOR DELETE USING (username = current_setting('app.current_username', true));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to set claims for RLS
CREATE OR REPLACE FUNCTION set_claim(uid uuid, claim text, value text)
RETURNS text AS $$
BEGIN
  -- Set the claim value in the current session
  PERFORM set_config('app.current_' || claim, value, false);
  RETURN value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Option 4: Using the Supabase UI

1. Go to the Table Editor in your Supabase dashboard
2. Create a new table named "users" with the following columns:
   - id (uuid, primary key, default: uuid_generate_v4())
   - username (text, not null, unique)
   - password (text, not null)
   - created_at (timestamptz, default: now())

3. Create another table named "user_projects" with the following columns:
   - id (uuid, primary key, default: uuid_generate_v4())
   - username (text, not null)
   - name (text, not null)
   - logo (text)
   - link (text)
   - twitter_link (text)
   - is_active (boolean, default: true)
   - last_activity (timestamptz, default: now())
   - notes (text)
   - join_date (timestamptz, default: now())
   - chain (text)
   - stage (text)
   - tags (jsonb)
   - type (text)
   - cost (numeric(10,2), default: 0)
   - created_at (timestamptz, default: now())
   - updated_at (timestamptz, default: now())

4. Enable Row Level Security for both tables
5. Create RLS policies for the user_projects table
