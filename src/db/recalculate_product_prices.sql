-- ========================================================
-- Schema Migration & recalculate_product_prices() Function
-- ========================================================

-- 1. Ensure clearance_price column exists on products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS clearance_price numeric;

-- 2. Create or Replace the pricing recalculation function
CREATE OR REPLACE FUNCTION public.recalculate_product_prices()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings record;
  v_exchange_rate numeric;
  v_shipping_per_kg numeric;
  v_sell_margin numeric;
  v_clear_margin numeric;
  v_single_costs_updated integer := 0;
  v_single_products_updated integer := 0;
  v_multi_costs_updated integer := 0;
  v_multi_variants_updated integer := 0;
BEGIN
  -- Retrieve active store settings
  SELECT
    cost_exchange_rate,
    shipping_per_kg,
    selling_margin_rate,
    clearance_margin_rate
  INTO v_settings
  FROM public.store_settings
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'store_settings 沒有任何設定資料';
  END IF;

  v_exchange_rate   := COALESCE(v_settings.cost_exchange_rate, 21.5);
  v_shipping_per_kg := COALESCE(v_settings.shipping_per_kg, 200.0);
  
  -- Margin rates normalization (if stored as 35 instead of 0.35)
  v_sell_margin  := COALESCE(v_settings.selling_margin_rate, 0.35);
  IF v_sell_margin >= 1 THEN v_sell_margin := v_sell_margin / 100.0; END IF;

  v_clear_margin := COALESCE(v_settings.clearance_margin_rate, 0.15);
  IF v_clear_margin >= 1 THEN v_clear_margin := v_clear_margin / 100.0; END IF;

  -- Guard against division by zero
  IF v_sell_margin >= 1.0 THEN v_sell_margin := 0.99; END IF;
  IF v_clear_margin >= 1.0 THEN v_clear_margin := 0.99; END IF;

  -- ========================================================
  -- [A] 單規格商品 (variant_id IS NULL)
  -- ========================================================
  -- 1. 計算 cost_twd (重量使用 products.weight) 並寫回 product_costs
  WITH updated_costs AS (
    UPDATE public.product_costs pc
    SET cost_twd = CEIL(((pc.cost_aud + (COALESCE(p.weight, 0) * v_shipping_per_kg)) * v_exchange_rate) / 10.0) * 10
    FROM public.products p
    WHERE pc.product_id = p.id
      AND pc.variant_id IS NULL
      AND pc.cost_aud IS NOT NULL
    RETURNING pc.id
  )
  SELECT COUNT(*) INTO v_single_costs_updated FROM updated_costs;

  -- 2. 依據 cost_twd 計算 products 的兩種價格 (以 10 元進位)
  WITH updated_prods AS (
    UPDATE public.products p
    SET
      price           = CEIL((pc.cost_twd / (1.0 - v_sell_margin)) / 10.0) * 10,
      clearance_price = CEIL((pc.cost_twd / (1.0 - v_clear_margin)) / 10.0) * 10
    FROM public.product_costs pc
    WHERE p.id = pc.product_id
      AND pc.variant_id IS NULL
      AND pc.cost_twd IS NOT NULL
    RETURNING p.id
  )
  SELECT COUNT(*) INTO v_single_products_updated FROM updated_prods;

  -- ========================================================
  -- [B] 多規格商品 (variant_id IS NOT NULL)
  -- ========================================================
  -- 1. 計算 cost_twd (重量使用 product_variants.weight) 並寫回 product_costs
  WITH updated_variant_costs AS (
    UPDATE public.product_costs pc
    SET cost_twd = CEIL(((pc.cost_aud + (COALESCE(pv.weight, 0) * v_shipping_per_kg)) * v_exchange_rate) / 10.0) * 10
    FROM public.product_variants pv
    WHERE pc.variant_id = pv.id
      AND pc.cost_aud IS NOT NULL
    RETURNING pc.id
  )
  SELECT COUNT(*) INTO v_multi_costs_updated FROM updated_variant_costs;

  -- 2. 依據 cost_twd 計算 product_variants 的兩種價格 (以 10 元進位)
  WITH updated_vars AS (
    UPDATE public.product_variants pv
    SET
      price           = CEIL((pc.cost_twd / (1.0 - v_sell_margin)) / 10.0) * 10,
      clearance_price = CEIL((pc.cost_twd / (1.0 - v_clear_margin)) / 10.0) * 10
    FROM public.product_costs pc
    WHERE pv.id = pc.variant_id
      AND pc.cost_twd IS NOT NULL
    RETURNING pv.id
  )
  SELECT COUNT(*) INTO v_multi_variants_updated FROM updated_vars;

  RETURN json_build_object(
    'status', 'success',
    'single_costs_updated', v_single_costs_updated,
    'single_products_updated', v_single_products_updated,
    'multi_costs_updated', v_multi_costs_updated,
    'multi_variants_updated', v_multi_variants_updated
  );
END;
$$;
