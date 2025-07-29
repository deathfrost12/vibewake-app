-- NOTIFICATION SYSTEM - Push notifications, preferences a scheduling
-- Tabulky pro správu notifikací, push tokens a uživatelských preferencí

-- 1. PUSH_TOKENS - Expo push tokens pro zařízení uživatelů
CREATE TABLE public.push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Token details
  expo_push_token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  device_id TEXT,
  device_name TEXT,
  
  -- Token status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Error tracking
  error_count INTEGER DEFAULT 0,
  last_error_at TIMESTAMPTZ,
  last_error_message TEXT,
  
  -- App version info
  app_version TEXT,
  expo_version TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NOTIFICATION_PREFERENCES - Uživatelské preference pro notifikace
CREATE TABLE public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Global settings
  notifications_enabled BOOLEAN DEFAULT true,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone TEXT DEFAULT 'Europe/Prague',
  
  -- Study reminder settings
  study_reminders_enabled BOOLEAN DEFAULT true,
  daily_reminder_time TIME DEFAULT '19:00',
  review_reminders_enabled BOOLEAN DEFAULT true,
  streak_reminders_enabled BOOLEAN DEFAULT true,
  
  -- Engagement notifications
  achievements_enabled BOOLEAN DEFAULT true,
  social_enabled BOOLEAN DEFAULT true,
  marketing_enabled BOOLEAN DEFAULT false,
  
  -- Advanced settings
  minimum_interval_minutes INTEGER DEFAULT 60, -- Minimum čas mezi notifikacemi
  max_daily_notifications INTEGER DEFAULT 5,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SCHEDULED_NOTIFICATIONS - Naplánované notifikace
CREATE TABLE public.scheduled_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Notification content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'daily_reminder', 'review_due', 'streak_reminder', 'achievement', 
    'study_break', 'weekly_summary', 'custom'
  )),
  
  -- Status & delivery
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'canceled')),
  sent_at TIMESTAMPTZ,
  failed_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Targeting
  push_token_id UUID REFERENCES public.push_tokens(id) ON DELETE SET NULL,
  expo_ticket_id TEXT, -- ID z Expo push service
  expo_receipt_id TEXT,
  
  -- Context & tracking
  related_study_set_id UUID REFERENCES public.study_sets(id) ON DELETE SET NULL,
  campaign_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NOTIFICATION_HISTORY - Historie všech odeslaných notifikací
CREATE TABLE public.notification_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_notification_id UUID REFERENCES public.scheduled_notifications(id) ON DELETE SET NULL,
  
  -- Notification details
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  
  -- Delivery tracking
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivery_status TEXT CHECK (delivery_status IN ('delivered', 'failed', 'bounced')),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Technical details
  expo_push_token TEXT,
  expo_ticket_id TEXT,
  expo_receipt_id TEXT,
  
  -- User interaction
  was_opened BOOLEAN DEFAULT false,
  was_clicked BOOLEAN DEFAULT false,
  action_taken TEXT, -- Co uživatel udělal po kliknutí
  
  -- Platform & context
  platform TEXT CHECK (platform IN ('ios', 'android')),
  app_state TEXT CHECK (app_state IN ('active', 'background', 'killed')), -- Stav app při doručení
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATION_TEMPLATES - Šablony pro různé typy notifikací
CREATE TABLE public.notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Template identification
  template_key TEXT NOT NULL UNIQUE, -- 'daily_reminder', 'review_due', etc.
  name TEXT NOT NULL,
  description TEXT,
  
  -- Content (with placeholders)
  title_template TEXT NOT NULL, -- "Čas na učení, {{name}}!"
  body_template TEXT NOT NULL, -- "Máš {{count}} karet k opakování"
  
  -- Localization
  language TEXT DEFAULT 'cs',
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  
  -- A/B testing
  variant_name TEXT,
  test_percentage DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTIFICATION_CAMPAIGNS - Skupinové notifikace a kampaně
CREATE TABLE public.notification_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Campaign details
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT CHECK (campaign_type IN ('broadcast', 'targeted', 'automated')),
  
  -- Content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  
  -- Targeting
  target_audience JSONB, -- Criteria pro targeting
  estimated_recipients INTEGER,
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  send_immediately BOOLEAN DEFAULT false,
  
  -- Status & results
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'canceled')),
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  
  -- Settings
  respect_quiet_hours BOOLEAN DEFAULT true,
  max_send_rate INTEGER DEFAULT 100, -- Notifications per minute
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ================================
-- INDEXES pro performance
-- ================================

-- Push tokens
CREATE INDEX idx_push_tokens_user ON public.push_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON public.push_tokens(is_active, last_used_at);
CREATE INDEX idx_push_tokens_token ON public.push_tokens(expo_push_token);

-- Scheduled notifications
CREATE INDEX idx_scheduled_notifications_user ON public.scheduled_notifications(user_id);
CREATE INDEX idx_scheduled_notifications_scheduled ON public.scheduled_notifications(scheduled_for, status);
CREATE INDEX idx_scheduled_notifications_type ON public.scheduled_notifications(notification_type);
CREATE INDEX idx_scheduled_notifications_status ON public.scheduled_notifications(status);

-- Notification history
CREATE INDEX idx_notification_history_user ON public.notification_history(user_id);
CREATE INDEX idx_notification_history_sent ON public.notification_history(sent_at);
CREATE INDEX idx_notification_history_opened ON public.notification_history(was_opened, opened_at);

-- Templates
CREATE INDEX idx_notification_templates_key ON public.notification_templates(template_key);
CREATE INDEX idx_notification_templates_active ON public.notification_templates(is_active);

-- ================================
-- TRIGGERS
-- ================================

-- Auto-update updated_at
CREATE TRIGGER push_tokens_updated_at BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER scheduled_notifications_updated_at BEFORE UPDATE ON public.scheduled_notifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER notification_templates_updated_at BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER notification_campaigns_updated_at BEFORE UPDATE ON public.notification_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ================================
-- HELPER FUNCTIONS
-- ================================

-- Funkce pro vytvoření default notification preferences při registraci
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Trigger pro automatické vytvoření notification preferences
CREATE TRIGGER create_notification_preferences_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_notification_preferences();

-- Funkce pro kontrolu quiet hours
CREATE OR REPLACE FUNCTION public.is_quiet_hours(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  prefs RECORD;
  current_time_in_tz TIME;
BEGIN
  -- Získat preference uživatele
  SELECT quiet_hours_enabled, quiet_hours_start, quiet_hours_end, timezone
  INTO prefs
  FROM public.notification_preferences
  WHERE user_id = user_uuid;
  
  -- Pokud quiet hours nejsou zapnuté
  IF NOT prefs.quiet_hours_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Získat aktuální čas v timezone uživatele
  current_time_in_tz := (NOW() AT TIME ZONE prefs.timezone)::TIME;
  
  -- Kontrola quiet hours (může přes půlnoc)
  IF prefs.quiet_hours_start <= prefs.quiet_hours_end THEN
    -- Normální rozsah (např. 22:00-08:00 = false, ale 22:00-06:00 = true)
    RETURN current_time_in_tz BETWEEN prefs.quiet_hours_start AND prefs.quiet_hours_end;
  ELSE
    -- Rozsah přes půlnoc (např. 22:00-06:00)
    RETURN current_time_in_tz >= prefs.quiet_hours_start OR current_time_in_tz <= prefs.quiet_hours_end;
  END IF;
END;
$function$;

-- Funkce pro plánování daily reminder notifikace
CREATE OR REPLACE FUNCTION public.schedule_daily_reminder(user_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  prefs RECORD;
  reminder_time TIMESTAMPTZ;
  notification_id UUID;
BEGIN
  -- Získat preference uživatele
  SELECT daily_reminder_time, timezone, study_reminders_enabled
  INTO prefs
  FROM public.notification_preferences
  WHERE user_id = user_uuid;
  
  -- Pokud nejsou study reminders zapnuté
  IF NOT prefs.study_reminders_enabled THEN
    RETURN NULL;
  END IF;
  
  -- Vypočítat čas pro dnešní reminder
  reminder_time := (CURRENT_DATE + prefs.daily_reminder_time) AT TIME ZONE prefs.timezone;
  
  -- Pokud už čas prošel, naplánovat na zítra
  IF reminder_time <= NOW() THEN
    reminder_time := reminder_time + INTERVAL '1 day';
  END IF;
  
  -- Vytvořit scheduled notification
  INSERT INTO public.scheduled_notifications (
    user_id, title, body, scheduled_for, notification_type
  ) VALUES (
    user_uuid,
    'Čas na učení! 📚',
    'Nezapomeň na svůj denní cíl. Každá minuta se počítá!',
    reminder_time,
    'daily_reminder'
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$; 