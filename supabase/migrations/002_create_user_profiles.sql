-- USER PROFILES - Basic user profile system for any mobile app
-- Extends auth.users with additional profile information

-- 1. USER PROFILES - Extended user information
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Basic profile info
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  
  -- App preferences
  theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  language_preference TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  
  -- Notification preferences
  push_notifications_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT true,
  marketing_emails_enabled BOOLEAN DEFAULT false,
  
  -- Analytics & tracking
  analytics_enabled BOOLEAN DEFAULT true,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  total_sessions INTEGER DEFAULT 0,
  
  -- Account status
  is_verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER SETTINGS - Flexible key-value settings storage
CREATE TABLE public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Setting key-value pairs
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  
  -- Metadata
  setting_type TEXT DEFAULT 'user' CHECK (setting_type IN ('user', 'app', 'system')),
  is_public BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one setting per user per key
  UNIQUE(user_id, setting_key)
);

-- 3. USER ACTIVITY LOG - Track important user actions
CREATE TABLE public.user_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Activity details
  activity_type TEXT NOT NULL, -- 'login', 'logout', 'profile_update', 'subscription_change', etc.
  activity_description TEXT,
  
  -- Context data
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  
  -- Location (optional)
  country_code TEXT,
  region TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- INDEXES for performance
-- ================================

-- User profiles
CREATE INDEX idx_user_profiles_premium ON public.user_profiles(is_premium);
CREATE INDEX idx_user_profiles_verified ON public.user_profiles(is_verified);
CREATE INDEX idx_user_profiles_last_active ON public.user_profiles(last_active_at DESC);

-- User settings
CREATE INDEX idx_user_settings_user ON public.user_settings(user_id);
CREATE INDEX idx_user_settings_key ON public.user_settings(setting_key);
CREATE INDEX idx_user_settings_type ON public.user_settings(setting_type);

-- User activity log
CREATE INDEX idx_user_activity_user ON public.user_activity_log(user_id);
CREATE INDEX idx_user_activity_type ON public.user_activity_log(activity_type);
CREATE INDEX idx_user_activity_date ON public.user_activity_log(created_at DESC);

-- ================================
-- TRIGGERS for automatic updates
-- ================================

-- Auto-update updated_at
CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ================================
-- FUNCTIONS for user management
-- ================================

-- Create user profile when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$function$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update last_active_at
CREATE OR REPLACE FUNCTION public.update_user_last_active(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.user_profiles 
  SET 
    last_active_at = NOW(),
    total_sessions = total_sessions + 1
  WHERE id = user_uuid;
END;
$function$;

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  user_uuid UUID,
  activity_type_param TEXT,
  activity_description_param TEXT DEFAULT NULL,
  metadata_param JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.user_activity_log (
    user_id,
    activity_type,
    activity_description,
    metadata,
    created_at
  )
  VALUES (
    user_uuid,
    activity_type_param,
    activity_description_param,
    metadata_param,
    NOW()
  )
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$function$;