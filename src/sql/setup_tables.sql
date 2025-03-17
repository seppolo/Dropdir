-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Buat tabel users untuk autentikasi
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel user_airdrops untuk menyimpan data airdrop
CREATE TABLE IF NOT EXISTS user_airdrops (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
    project VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    link VARCHAR(255),
    twitter VARCHAR(100),
    notes TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    chain VARCHAR(50),
    stage VARCHAR(50),
    tags VARCHAR(100),
    type VARCHAR(50),
    cost DECIMAL(10, 2),
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buat trigger untuk memperbarui last_activity saat baris diupdate
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_airdrop_activity
BEFORE UPDATE ON user_airdrops
FOR EACH ROW EXECUTE FUNCTION update_last_activity();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
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

-- Create a function to set claims for RLS
CREATE OR REPLACE FUNCTION set_claim(claim text, value text)
RETURNS text AS $$
BEGIN
  -- Set the claim value in the current session
  PERFORM set_config('app.current_' || claim, value, false);
  RETURN value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
