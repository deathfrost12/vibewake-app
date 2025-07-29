-- ANALYTICS SYSTEM - User events, behavior tracking a performance metrics
-- Tabulky pro sledování uživatelského chování a analytics

-- 1. USER_EVENTS - Základní user events pro PostHog a vlastní analytics
CREATE TABLE public.user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Event identification
  event_name TEXT NOT NULL, -- 'study_session_started', 'card_reviewed', 'subscription_purchased'
  event_category TEXT, -- 'engagement', 'monetization', 'education'
  
  -- Event data
  properties JSONB DEFAULT '{}', -- Flexible event properties
  user_properties JSONB DEFAULT '{}', -- User context at time of event
  
  -- Session & device context
  session_id TEXT,
  device_id TEXT,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  app_version TEXT,
  
  -- Timing & location
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  timezone TEXT,
  country TEXT,
  
  -- Attribution & marketing
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  
  -- PostHog integration
  posthog_event_id TEXT,
  distinct_id TEXT, -- PostHog distinct_id
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SESSION_ANALYTICS - Detailní analytics session informace
CREATE TABLE public.session_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session identification
  session_id TEXT NOT NULL UNIQUE,
  session_type TEXT CHECK (session_type IN ('study', 'browse', 'onboarding', 'settings')),
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Activity metrics
  screens_visited TEXT[] DEFAULT '{}',
  screen_count INTEGER DEFAULT 0,
  
  -- Study-specific metrics
  cards_studied INTEGER DEFAULT 0,
  sets_accessed INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  
  -- Engagement metrics
  taps_count INTEGER DEFAULT 0,
  swipes_count INTEGER DEFAULT 0,
  time_in_background_seconds INTEGER DEFAULT 0,
  
  -- Technical details
  device_id TEXT,
  platform TEXT CHECK (platform IN ('ios', 'android')),
  app_version TEXT,
  network_type TEXT, -- 'wifi', 'cellular', 'offline'
  
  -- Performance
  app_launch_time_ms INTEGER,
  crash_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FUNNEL_EVENTS - Events pro conversion funnel tracking
CREATE TABLE public.funnel_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Funnel identification
  funnel_name TEXT NOT NULL, -- 'onboarding', 'subscription', 'first_study'
  step_name TEXT NOT NULL, -- 'welcome_screen', 'payment_screen', 'study_completed'
  step_order INTEGER NOT NULL,
  
  -- Event details
  completed BOOLEAN DEFAULT true,
  dropped_off BOOLEAN DEFAULT false,
  conversion_value DECIMAL(10,2), -- Pro revenue funnels
  
  -- Context
  session_id TEXT,
  previous_step_id UUID REFERENCES public.funnel_events(id),
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  
  -- Additional data
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. A_B_TEST_ASSIGNMENTS - A/B test assignments a results
CREATE TABLE public.ab_test_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Test identification
  test_name TEXT NOT NULL, -- 'onboarding_flow_v2', 'payment_button_color'
  variant_name TEXT NOT NULL, -- 'control', 'variant_a', 'variant_b'
  
  -- Assignment details
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_control_group BOOLEAN DEFAULT false,
  
  -- Test metadata
  test_version TEXT,
  assignment_reason TEXT, -- 'random', 'sticky', 'forced'
  
  -- Results tracking
  converted BOOLEAN DEFAULT false,
  conversion_event TEXT,
  converted_at TIMESTAMPTZ,
  conversion_value DECIMAL(10,2),
  
  -- Context
  assignment_session_id TEXT,
  device_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: jeden assignment na test na uživatele
  UNIQUE(user_id, test_name)
);

-- 5. COHORT_ANALYSIS - Cohort tracking pro retention analysis
CREATE TABLE public.cohort_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Cohort definition
  cohort_type TEXT NOT NULL, -- 'registration', 'first_purchase', 'first_study'
  cohort_date DATE NOT NULL, -- Den kdy uživatel vstoupil do cohorty
  cohort_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  
  -- Retention tracking
  period_number INTEGER NOT NULL, -- 0=first period, 1=second period, etc.
  period_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false, -- Byl aktivní v tomto období?
  
  -- Activity metrics for the period
  sessions_count INTEGER DEFAULT 0,
  study_time_minutes INTEGER DEFAULT 0,
  cards_studied INTEGER DEFAULT 0,
  revenue_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Calculated fields
  days_since_cohort_start INTEGER,
  retention_rate DECIMAL(5,4), -- Will be calculated via analytics
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(user_id, cohort_type, cohort_date, period_number)
);

-- 6. FEATURE_USAGE - Tracking využití jednotlivých features
CREATE TABLE public.feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Feature identification
  feature_name TEXT NOT NULL, -- 'magic_notes', 'spaced_repetition', 'offline_mode'
  feature_category TEXT, -- 'core', 'premium', 'experimental'
  
  -- Usage details
  used_at TIMESTAMPTZ DEFAULT NOW(),
  usage_duration_seconds INTEGER,
  interaction_count INTEGER DEFAULT 1,
  
  -- Success metrics
  completed_successfully BOOLEAN DEFAULT true,
  error_occurred BOOLEAN DEFAULT false,
  error_message TEXT,
  
  -- Context
  session_id TEXT,
  screen_name TEXT,
  
  -- Value tracking
  value_created TEXT, -- 'flashcard_created', 'study_set_completed'
  value_amount INTEGER, -- Quantifiable value (cards created, points earned)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PERFORMANCE_METRICS - App performance tracking
CREATE TABLE public.performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Metric identification
  metric_name TEXT NOT NULL, -- 'app_startup_time', 'screen_load_time', 'api_response_time'
  metric_category TEXT, -- 'performance', 'network', 'ui'
  
  -- Metric values
  value_numeric DECIMAL(12,4), -- Numeric value (milliseconds, bytes, etc.)
  value_text TEXT, -- Text value if needed
  unit TEXT, -- 'ms', 'bytes', 'fps'
  
  -- Context
  screen_name TEXT,
  action_name TEXT,
  session_id TEXT,
  
  -- Technical details
  device_model TEXT,
  os_version TEXT,
  app_version TEXT,
  network_type TEXT,
  
  -- Timestamps
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- VIEWS pro analytics dashboards
-- ================================

-- Daily Active Users (DAU)
CREATE OR REPLACE VIEW analytics_dau AS
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as dau,
  COUNT(DISTINCT CASE WHEN platform = 'ios' THEN user_id END) as dau_ios,
  COUNT(DISTINCT CASE WHEN platform = 'android' THEN user_id END) as dau_android
FROM public.user_events 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Study Session Analytics
CREATE OR REPLACE VIEW analytics_study_sessions AS
SELECT 
  DATE(started_at) as date,
  COUNT(*) as total_sessions,
  AVG(duration_seconds) as avg_duration_seconds,
  AVG(cards_studied) as avg_cards_per_session,
  AVG(CASE WHEN cards_studied > 0 THEN correct_answers::DECIMAL / cards_studied * 100 END) as avg_accuracy_percentage
FROM public.session_analytics 
WHERE session_type = 'study' 
AND started_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(started_at)
ORDER BY date DESC;

-- Retention Rates by Cohort
CREATE OR REPLACE VIEW analytics_retention AS
SELECT 
  cohort_date,
  cohort_type,
  period_number,
  COUNT(DISTINCT user_id) as cohort_size,
  COUNT(DISTINCT CASE WHEN is_active THEN user_id END) as active_users,
  ROUND(
    COUNT(DISTINCT CASE WHEN is_active THEN user_id END)::DECIMAL / 
    NULLIF(COUNT(DISTINCT user_id), 0) * 100, 2
  ) as retention_percentage
FROM public.cohort_analysis
GROUP BY cohort_date, cohort_type, period_number
ORDER BY cohort_date DESC, period_number;

-- ================================
-- INDEXES pro performance
-- ================================

-- User events
CREATE INDEX idx_user_events_user_time ON public.user_events(user_id, timestamp);
CREATE INDEX idx_user_events_name ON public.user_events(event_name);
CREATE INDEX idx_user_events_category ON public.user_events(event_category);
CREATE INDEX idx_user_events_session ON public.user_events(session_id);
CREATE INDEX idx_user_events_time ON public.user_events(timestamp);

-- Session analytics
CREATE INDEX idx_session_analytics_user ON public.session_analytics(user_id);
CREATE INDEX idx_session_analytics_session ON public.session_analytics(session_id);
CREATE INDEX idx_session_analytics_started ON public.session_analytics(started_at);
CREATE INDEX idx_session_analytics_type ON public.session_analytics(session_type);

-- Funnel events
CREATE INDEX idx_funnel_events_user ON public.funnel_events(user_id);
CREATE INDEX idx_funnel_events_funnel ON public.funnel_events(funnel_name, step_order);
CREATE INDEX idx_funnel_events_step ON public.funnel_events(step_name);

-- A/B tests
CREATE INDEX idx_ab_test_assignments_user ON public.ab_test_assignments(user_id);
CREATE INDEX idx_ab_test_assignments_test ON public.ab_test_assignments(test_name);
CREATE INDEX idx_ab_test_assignments_variant ON public.ab_test_assignments(test_name, variant_name);

-- Cohorts
CREATE INDEX idx_cohort_analysis_user ON public.cohort_analysis(user_id);
CREATE INDEX idx_cohort_analysis_cohort ON public.cohort_analysis(cohort_type, cohort_date);
CREATE INDEX idx_cohort_analysis_period ON public.cohort_analysis(period_date);

-- Feature usage
CREATE INDEX idx_feature_usage_user ON public.feature_usage(user_id);
CREATE INDEX idx_feature_usage_feature ON public.feature_usage(feature_name);
CREATE INDEX idx_feature_usage_time ON public.feature_usage(used_at);

-- Performance metrics
CREATE INDEX idx_performance_metrics_metric ON public.performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_time ON public.performance_metrics(measured_at);

-- ================================
-- HELPER FUNCTIONS
-- ================================

-- Funkce pro vytvoření cohort záznamu pro nového uživatele
CREATE OR REPLACE FUNCTION public.create_user_cohort_records()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  -- Registration cohort
  INSERT INTO public.cohort_analysis (
    user_id, cohort_type, cohort_date, cohort_period, period_number, period_date, is_active
  ) VALUES (
    NEW.id, 'registration', CURRENT_DATE, 'daily', 0, CURRENT_DATE, true
  );
  
  RETURN NEW;
END;
$function$;

-- Trigger pro automatické vytvoření cohort záznamů
CREATE TRIGGER create_cohort_records_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_user_cohort_records();

-- Funkce pro tracking conversion funnel events
CREATE OR REPLACE FUNCTION public.track_funnel_conversion(
  p_user_id UUID,
  p_funnel_name TEXT,
  p_step_name TEXT,
  p_step_order INTEGER,
  p_session_id TEXT DEFAULT NULL,
  p_conversion_value DECIMAL DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  event_id UUID;
  previous_step_id UUID;
BEGIN
  -- Najít předchozí krok v této funnel
  SELECT id INTO previous_step_id
  FROM public.funnel_events
  WHERE user_id = p_user_id 
  AND funnel_name = p_funnel_name
  AND step_order = p_step_order - 1
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Vytvořit funnel event
  INSERT INTO public.funnel_events (
    user_id, funnel_name, step_name, step_order, session_id, 
    previous_step_id, conversion_value, completed_at
  ) VALUES (
    p_user_id, p_funnel_name, p_step_name, p_step_order, p_session_id,
    previous_step_id, p_conversion_value, NOW()
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$function$; 