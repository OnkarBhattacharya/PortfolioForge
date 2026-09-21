-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  links JSONB DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  theme_id TEXT DEFAULT 'minimal',
  custom_theme JSONB,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'studio')),
  subscription_status TEXT DEFAULT 'inactive',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Items
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_md TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  project_url TEXT,
  repo_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Themes (static seed data)
CREATE TABLE themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  css_vars JSONB NOT NULL,
  preview_image_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE
);

-- Contact Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Usage Tracking (for rate limiting)
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_in INT DEFAULT 0,
  tokens_out INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portfolio_items_user_id ON portfolio_items(user_id);
CREATE INDEX idx_portfolio_items_featured ON portfolio_items(user_id, featured) WHERE featured;
CREATE INDEX idx_portfolio_items_sort ON portfolio_items(user_id, sort_order);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_ai_usage_user_date ON ai_usage(user_id, created_at DESC);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_owner_write" ON profiles FOR ALL USING (auth.uid() = id);

-- Portfolio Items: public read, owner write
CREATE POLICY "portfolio_public_read" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "portfolio_owner_write" ON portfolio_items FOR ALL USING (auth.uid() = user_id);

-- Themes: public read only
CREATE POLICY "themes_public_read" ON themes FOR SELECT USING (true);

-- Messages: owner read only
CREATE POLICY "messages_owner_read" ON messages FOR SELECT USING (auth.uid() = user_id);

-- AI Usage: owner read only
CREATE POLICY "ai_usage_owner_read" ON ai_usage FOR SELECT USING (auth.uid() = user_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    'user_' || substr(NEW.id::text, 1, 8),
    NEW.raw_user_meta_data->>'full_name',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed themes
INSERT INTO themes (id, name, description, css_vars, preview_image_url, is_premium) VALUES
('minimal', 'Minimal', 'Clean and simple', '{"background":"0 0% 100%","foreground":"222.2 84% 4.9%","primary":"221.2 83.2% 53.3%","primary-foreground":"210 40% 98%","secondary":"210 40% 96.1%","secondary-foreground":"222.2 47.4% 11.2%","muted":"210 40% 96.1%","muted-foreground":"215.4 16.3% 46.9%","accent":"210 40% 96.1%","accent-foreground":"222.2 47.4% 11.2%","destructive":"0 84.2% 60.2%","destructive-foreground":"210 40% 98%","border":"214.3 31.8% 91.4%","input":"214.3 31.8% 91.4%","ring":"221.2 83.2% 53.3%","radius":"0.5rem","font-heading":"Inter, system-ui, sans-serif","font-body":"Inter, system-ui, sans-serif"}', NULL, FALSE),
('developer', 'Developer', 'Code-focused with mono fonts', '{"background":"222.2 84% 4.9%","foreground":"210 40% 98%","primary":"263.4 70% 50.4%","primary-foreground":"210 40% 98%","secondary":"217.2 32.6% 17.5%","secondary-foreground":"210 40% 98%","muted":"217.2 32.6% 17.5%","muted-foreground":"215 20.2% 65.1%","accent":"217.2 32.6% 17.5%","accent-foreground":"210 40% 98%","destructive":"0 62.8% 30.6%","destructive-foreground":"210 40% 98%","border":"217.2 32.6% 17.5%","input":"217.2 32.6% 17.5%","ring":"263.4 70% 50.4%","radius":"0.375rem","font-heading":"JetBrains Mono, monospace","font-body":"JetBrains Mono, monospace"}', NULL, FALSE),
('creative', 'Creative', 'Bold and expressive', '{"background":"45 100% 98%","foreground":"25 30% 10%","primary":"25 95% 53%","primary-foreground":"25 30% 10%","secondary":"45 30% 90%","secondary-foreground":"25 30% 10%","muted":"45 30% 90%","muted-foreground":"25 20% 40%","accent":"330 80% 60%","accent-foreground":"25 30% 10%","destructive":"0 84% 60%","destructive-foreground":"45 100% 98%","border":"45 30% 85%","input":"45 30% 85%","ring":"25 95% 53%","radius":"1rem","font-heading":"Playfair Display, serif","font-body":"Inter, system-ui, sans-serif"}', NULL, FALSE),
('dark', 'Dark', 'Sleek dark mode', '{"background":"224 71% 4%","foreground":"213 31% 91%","primary":"217 91% 60%","primary-foreground":"222 47% 11%","secondary":"222 47% 11%","secondary-foreground":"210 40% 98%","muted":"223 47% 11%","muted-foreground":"215 20% 65%","accent":"222 47% 11%","accent-foreground":"210 40% 98%","destructive":"0 63% 31%","destructive-foreground":"210 40% 98%","border":"216 34% 17%","input":"216 34% 17%","ring":"217 91% 60%","radius":"0.5rem","font-heading":"Space Grotesk, sans-serif","font-body":"Inter, system-ui, sans-serif"}', NULL, FALSE)
ON CONFLICT (id) DO NOTHING;