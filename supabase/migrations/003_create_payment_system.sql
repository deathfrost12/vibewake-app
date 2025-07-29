-- PAYMENT SYSTEM - RevenueCat integration a subscription management
-- Tabulky pro správu předplatných, nákupů a webhook events

-- 1. SUBSCRIPTIONS - Detailní záznamy předplatných z RevenueCat
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- RevenueCat identifiers
  revenuecat_customer_id TEXT NOT NULL,
  revenuecat_subscription_id TEXT UNIQUE,
  original_transaction_id TEXT,
  
  -- Subscription details
  product_id TEXT NOT NULL, -- 'repetito_plus_monthly', 'repetito_plus_yearly'
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'plus')),
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly', 'lifetime')),
  
  -- Status & timing
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'paused', 'billing_issue', 'in_grace_period')),
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  renewed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  
  -- Pricing & currency
  price_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'CZK',
  
  -- Platform & store
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  store TEXT NOT NULL CHECK (store IN ('app_store', 'play_store', 'stripe')),
  
  -- Trial & promotions
  is_trial BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  promotional_offer_id TEXT,
  
  -- Auto-renewal
  auto_renew_enabled BOOLEAN DEFAULT true,
  will_renew BOOLEAN DEFAULT true,
  
  -- RevenueCat webhook data
  webhook_event_id UUID,
  last_webhook_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PURCHASES - Jednotlivé nákupy a transakce
CREATE TABLE public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  
  -- RevenueCat identifiers  
  revenuecat_customer_id TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  original_transaction_id TEXT,
  
  -- Purchase details
  product_id TEXT NOT NULL,
  product_type TEXT CHECK (product_type IN ('subscription', 'consumable', 'non_consumable')),
  
  -- Financial details
  price_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CZK',
  revenue_amount DECIMAL(10,2), -- Po odečtení fees
  
  -- Transaction status
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'failed', 'refunded', 'canceled')),
  purchase_date TIMESTAMPTZ NOT NULL,
  refund_date TIMESTAMPTZ,
  
  -- Platform details
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  store TEXT NOT NULL CHECK (store IN ('app_store', 'play_store', 'stripe')),
  store_transaction_id TEXT,
  
  -- Validation & fraud
  is_validated BOOLEAN DEFAULT false,
  validation_date TIMESTAMPTZ,
  is_fraudulent BOOLEAN DEFAULT false,
  
  -- Attribution & marketing
  attribution_source TEXT,
  campaign_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WEBHOOK_EVENTS - Log všech RevenueCat webhook událostí
CREATE TABLE public.webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- RevenueCat webhook details
  event_type TEXT NOT NULL, -- 'INITIAL_PURCHASE', 'RENEWAL', 'CANCELLATION', etc.
  event_id TEXT UNIQUE, -- RevenueCat event ID
  revenuecat_customer_id TEXT,
  
  -- Processing status
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processed', 'failed', 'ignored')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Raw webhook data
  raw_payload JSONB NOT NULL,
  webhook_source TEXT DEFAULT 'revenuecat',
  
  -- Related records
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PAYMENT_METHODS - Uložené platební metody uživatelů
CREATE TABLE public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment method details
  payment_type TEXT NOT NULL CHECK (payment_type IN ('card', 'paypal', 'apple_pay', 'google_pay')),
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Card details (encrypted/tokenized)
  card_last_four TEXT,
  card_brand TEXT, -- 'visa', 'mastercard', 'amex'
  card_expires_month INTEGER,
  card_expires_year INTEGER,
  
  -- External provider IDs
  stripe_payment_method_id TEXT,
  revenuecat_payment_method_id TEXT,
  
  -- Billing details
  billing_name TEXT,
  billing_email TEXT,
  billing_country TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REFUNDS - Vrácení peněz a storna
CREATE TABLE public.refunds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE NOT NULL,
  
  -- Refund details
  refund_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CZK',
  refund_reason TEXT,
  refund_type TEXT CHECK (refund_type IN ('full', 'partial', 'prorated')),
  
  -- Processing
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'rejected', 'failed')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  
  -- External references
  store_refund_id TEXT,
  support_ticket_id TEXT,
  
  -- Admin details
  processed_by_admin UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BILLING_HISTORY - Historie všech billing událostí
CREATE TABLE public.billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  
  -- Event details
  event_type TEXT NOT NULL, -- 'subscription_started', 'payment_successful', 'payment_failed', etc.
  event_description TEXT,
  
  -- Financial impact
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'CZK',
  
  -- Status & metadata
  status TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- INDEXES pro performance
-- ================================

-- Subscriptions
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_expires ON public.subscriptions(expires_at);
CREATE INDEX idx_subscriptions_revenuecat ON public.subscriptions(revenuecat_customer_id);

-- Purchases
CREATE INDEX idx_purchases_user ON public.purchases(user_id);
CREATE INDEX idx_purchases_transaction ON public.purchases(transaction_id);
CREATE INDEX idx_purchases_date ON public.purchases(purchase_date);
CREATE INDEX idx_purchases_status ON public.purchases(status);

-- Webhook events
CREATE INDEX idx_webhook_events_status ON public.webhook_events(processing_status);
CREATE INDEX idx_webhook_events_customer ON public.webhook_events(revenuecat_customer_id);
CREATE INDEX idx_webhook_events_type ON public.webhook_events(event_type);
CREATE INDEX idx_webhook_events_created ON public.webhook_events(created_at);

-- Payment methods
CREATE INDEX idx_payment_methods_user ON public.payment_methods(user_id);
CREATE INDEX idx_payment_methods_active ON public.payment_methods(user_id, is_active);

-- ================================
-- TRIGGERS
-- ================================

-- Auto-update updated_at timestamps
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER webhook_events_updated_at BEFORE UPDATE ON public.webhook_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER payment_methods_updated_at BEFORE UPDATE ON public.payment_methods  
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ================================
-- HELPER FUNCTIONS
-- ================================

-- Funkce pro získání aktuálního subscription status uživatele
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  sub_status TEXT;
  sub_expires TIMESTAMPTZ;
BEGIN
  SELECT status, expires_at 
  INTO sub_status, sub_expires
  FROM public.subscriptions 
  WHERE user_id = user_uuid 
  AND status IN ('active', 'in_grace_period')
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Pokud nemá žádné subscription
  IF sub_status IS NULL THEN
    RETURN 'free';
  END IF;
  
  -- Pokud je subscription expirované
  IF sub_expires IS NOT NULL AND sub_expires < NOW() THEN
    RETURN 'expired';
  END IF;
  
  -- Vrátit aktuální status
  RETURN CASE 
    WHEN sub_status = 'active' THEN 'plus'
    ELSE sub_status
  END;
END;
$function$;

-- Funkce pro update user profile subscription_plan podle subscription
CREATE OR REPLACE FUNCTION public.sync_user_subscription_plan()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  current_status TEXT;
BEGIN
  -- Získat aktuální subscription status
  current_status := public.get_user_subscription_status(NEW.user_id);
  
  -- Update profiles table
  UPDATE public.profiles 
  SET 
    subscription_plan = CASE 
      WHEN current_status = 'plus' THEN 'plus'
      ELSE 'free'
    END,
    subscription_expires_at = CASE
      WHEN current_status = 'plus' THEN NEW.expires_at
      ELSE NULL
    END,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

-- Trigger pro automatické synchronizace subscription plan v profiles
CREATE TRIGGER sync_subscription_plan_trigger
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_subscription_plan();

-- ================================
-- PARTIAL UNIQUE CONSTRAINTS (jako indexy)
-- ================================

-- Pouze jeden active subscription na uživatele
CREATE UNIQUE INDEX idx_subscriptions_user_active 
ON public.subscriptions(user_id) 
WHERE status = 'active';

-- Pouze jeden primary payment method na uživatele  
CREATE UNIQUE INDEX idx_payment_methods_user_primary
ON public.payment_methods(user_id)
WHERE is_primary = true; 