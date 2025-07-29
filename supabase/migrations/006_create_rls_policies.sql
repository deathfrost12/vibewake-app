-- ROW LEVEL SECURITY POLICIES
-- Zabezpečení všech tabulek pomocí RLS policies

-- ================================
-- POVOLENÍ RLS na všech tabulkách
-- ================================

-- Study System
ALTER TABLE public.study_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_reviews ENABLE ROW LEVEL SECURITY;

-- Payment System
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

-- Notification System
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- Analytics System
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- ================================
-- STUDY SYSTEM RLS POLICIES
-- ================================

-- STUDY_SETS - Uživatelé vidí pouze své vlastní + veřejné sady
CREATE POLICY "study_sets_select" ON public.study_sets FOR SELECT USING (
  is_public = true OR creator_id = auth.uid()
);

CREATE POLICY "study_sets_insert" ON public.study_sets FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND creator_id = auth.uid()
);

CREATE POLICY "study_sets_update" ON public.study_sets FOR UPDATE USING (
  creator_id = auth.uid()
) WITH CHECK (
  creator_id = auth.uid()
);

CREATE POLICY "study_sets_delete" ON public.study_sets FOR DELETE USING (
  creator_id = auth.uid()
);

-- FLASHCARDS - Přístup přes study_set ownership
CREATE POLICY "flashcards_select" ON public.flashcards FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.study_sets 
    WHERE id = flashcards.study_set_id 
    AND (is_public = true OR creator_id = auth.uid())
  )
);

CREATE POLICY "flashcards_insert" ON public.flashcards FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.study_sets 
    WHERE id = flashcards.study_set_id 
    AND creator_id = auth.uid()
  )
);

CREATE POLICY "flashcards_update" ON public.flashcards FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.study_sets 
    WHERE id = flashcards.study_set_id 
    AND creator_id = auth.uid()
  )
);

CREATE POLICY "flashcards_delete" ON public.flashcards FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.study_sets 
    WHERE id = flashcards.study_set_id 
    AND creator_id = auth.uid()
  )
);

-- CARD_PROGRESS - Pouze vlastní pokrok
CREATE POLICY "card_progress_all" ON public.card_progress FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- STUDY_SESSIONS - Pouze vlastní session
CREATE POLICY "study_sessions_all" ON public.study_sessions FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- CARD_REVIEWS - Pouze vlastní reviews
CREATE POLICY "card_reviews_all" ON public.card_reviews FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- ================================
-- PAYMENT SYSTEM RLS POLICIES
-- ================================

-- SUBSCRIPTIONS - Pouze vlastní subscription data
CREATE POLICY "subscriptions_all" ON public.subscriptions FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- PURCHASES - Pouze vlastní nákupy
CREATE POLICY "purchases_all" ON public.purchases FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- WEBHOOK_EVENTS - Pouze system access (service_role)
CREATE POLICY "webhook_events_system_only" ON public.webhook_events FOR ALL USING (
  auth.role() = 'service_role'
);

-- Pro read access webhook events pro uživatele (pokud je user_id = auth.uid())
CREATE POLICY "webhook_events_user_read" ON public.webhook_events FOR SELECT USING (
  user_id = auth.uid()
);

-- PAYMENT_METHODS - Pouze vlastní platební metody
CREATE POLICY "payment_methods_all" ON public.payment_methods FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- REFUNDS - Pouze vlastní refunds
CREATE POLICY "refunds_all" ON public.refunds FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- BILLING_HISTORY - Pouze vlastní billing historie
CREATE POLICY "billing_history_all" ON public.billing_history FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- ================================
-- NOTIFICATION SYSTEM RLS POLICIES
-- ================================

-- PUSH_TOKENS - Pouze vlastní push tokens
CREATE POLICY "push_tokens_all" ON public.push_tokens FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- NOTIFICATION_PREFERENCES - Pouze vlastní preferences
CREATE POLICY "notification_preferences_all" ON public.notification_preferences FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- SCHEDULED_NOTIFICATIONS - Pouze vlastní notifikace + system access
CREATE POLICY "scheduled_notifications_user" ON public.scheduled_notifications FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY "scheduled_notifications_system" ON public.scheduled_notifications FOR ALL USING (
  auth.role() = 'service_role'
);

-- NOTIFICATION_HISTORY - Pouze vlastní historie
CREATE POLICY "notification_history_all" ON public.notification_history FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- ================================
-- ANALYTICS SYSTEM RLS POLICIES
-- ================================

-- USER_EVENTS - Pouze vlastní events + anonymní events
CREATE POLICY "user_events_own" ON public.user_events FOR ALL USING (
  user_id = auth.uid() OR user_id IS NULL
) WITH CHECK (
  user_id = auth.uid() OR user_id IS NULL
);

-- SESSION_ANALYTICS - Pouze vlastní sessions
CREATE POLICY "session_analytics_all" ON public.session_analytics FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- FUNNEL_EVENTS - Pouze vlastní funnel events
CREATE POLICY "funnel_events_all" ON public.funnel_events FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- AB_TEST_ASSIGNMENTS - Pouze vlastní A/B test assignments
CREATE POLICY "ab_test_assignments_all" ON public.ab_test_assignments FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- COHORT_ANALYSIS - Pouze vlastní cohort data
CREATE POLICY "cohort_analysis_all" ON public.cohort_analysis FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- FEATURE_USAGE - Pouze vlastní usage data
CREATE POLICY "feature_usage_all" ON public.feature_usage FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- PERFORMANCE_METRICS - Pouze vlastní metrics
CREATE POLICY "performance_metrics_all" ON public.performance_metrics FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- ================================
-- ADMIN/TEMPLATE TABLES (Public Read)
-- ================================

-- NOTIFICATION_TEMPLATES - Všichni uživatelé můžou číst, pouze service_role modify
CREATE POLICY "notification_templates_read" ON public.notification_templates FOR SELECT USING (true);

CREATE POLICY "notification_templates_modify" ON public.notification_templates 
FOR ALL USING (auth.role() = 'service_role');

-- NOTIFICATION_CAMPAIGNS - Pouze service_role access
CREATE POLICY "notification_campaigns_system_only" ON public.notification_campaigns 
FOR ALL USING (auth.role() = 'service_role');

-- ================================
-- SPECIAL FUNCTIONS PRO RLS
-- ================================

-- Funkce pro kontrolu, zda má uživatel premium subscription
CREATE OR REPLACE FUNCTION public.user_has_premium_access(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  subscription_status TEXT;
BEGIN
  IF user_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  subscription_status := public.get_user_subscription_status(user_uuid);
  RETURN subscription_status = 'plus';
END;
$function$;

-- Funkce pro kontrolu vlastnictví study_set
CREATE OR REPLACE FUNCTION public.user_owns_study_set(set_id UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = ''
AS $function$
BEGIN
  IF user_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.study_sets 
    WHERE id = set_id AND creator_id = user_uuid
  );
END;
$function$;

-- ================================
-- PREMIUM CONTENT RLS POLICY
-- ================================

-- Rozšířená policy pro study_sets s premium kontrolou
DROP POLICY IF EXISTS "study_sets_select" ON public.study_sets;

CREATE POLICY "study_sets_select_with_premium" ON public.study_sets FOR SELECT USING (
  -- Veřejné free sady
  (is_public = true AND is_premium = false) OR
  -- Premium sady pouze pro Plus uživatele
  (is_public = true AND is_premium = true AND public.user_has_premium_access()) OR
  -- Vlastní sady vždy
  (creator_id = auth.uid())
);

-- ================================
-- SECURITY POZNÁMKY
-- ================================

-- 1. Všechny user-specific tabulky jsou chráněné auth.uid()
-- 2. Public content (study_sets) má premium gating
-- 3. System tables (webhooks, campaigns) pouze pro service_role
-- 4. Anonymous events povoleny pro analytics
-- 5. Template tables jsou read-only pro uživatele

-- 6. Důležité: Service role má vždy plný přístup pro:
--    - Webhook processing
--    - Analytics aggregation  
--    - Admin operations
--    - Automated tasks 