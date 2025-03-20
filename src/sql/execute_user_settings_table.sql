-- Execute this script to create the user_settings table in your Supabase database

-- First, make sure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the user_settings table
\i create_user_settings_table_complete.sql

-- Grant necessary permissions
GRANT ALL ON TABLE user_settings TO authenticated;
GRANT ALL ON TABLE user_settings TO service_role;

SELECT 'User settings table created successfully' as result;
