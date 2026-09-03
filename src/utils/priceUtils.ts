import { Product, ProductVariant, CartItem } from '../types';

/**
 * Returns the actual selling price for a variant:
 * - is_sale === true -> clearance_price (fallback to price if clearance_price is null)
 * - is_sale === false -> price
 * Directly uses precomputed prices from Supabase recalculate_product_prices().
 */
export function getVariantEffectivePrice(variant: ProductVariant): number {
  if (variant.is_sale && variant.clearance_price != null) {
    return Number(variant.clearance_price);
  }
  return Number(variant.price) || 0;
}

/**
 * Returns the normal price for a variant:
 * - price
 */
export function getVariantNormalPrice(variant: ProductVariant): number {
  return Number(variant.price) || 0;
}

/**
 * Returns the actual selling price for a product:
 * Uses the selected variant (or the primary/first variant if none selected).
 * - is_sale === true -> clearance_price
 * - is_sale === false -> price
 */
export function getProductEffectivePrice(
  product: Product,
  selectedVariant?: ProductVariant | null
): number {
  if (selectedVariant) {
    return getVariantEffectivePrice(selectedVariant);
  }
  if (product.variants && product.variants.length > 0) {
    return getVariantEffectivePrice(product.variants[0]);
  }
  if (product.isClearance && product.clearancePrice != null) {
    return Number(product.clearancePrice);
  }
  return Number(product.price) || 0;
}

/**
 * Returns the normal price for a product:
 * Uses the selected variant (or the primary/first variant if none selected).
 */
export function getProductNormalPrice(
  product: Product,
  selectedVariant?: ProductVariant | null
): number {
  if (selectedVariant) {
    return getVariantNormalPrice(selectedVariant);
  }
  if (product.variants && product.variants.length > 0) {
    return getVariantNormalPrice(product.variants[0]);
  }
  return Number(product.price) || 0;
}

/**
 * Returns whether the active variant (or product) is on sale.
 * For a product with variants: returns true if any active variant is on sale.
 */
export function isItemOnSale(
  product: Product,
  selectedVariant?: ProductVariant | null
): boolean {
  if (selectedVariant) {
    return Boolean(selectedVariant.is_sale);
  }
  if (product.variants && product.variants.length > 0) {
    return product.variants.some((v) => Boolean(v.is_sale));
  }
  return Boolean(product.isClearance);
}

/**
 * Returns whether the active variant (or product) is marked as new.
 * For a product with variants: returns true if any active variant is new.
 */
export function isItemNew(
  product: Product,
  selectedVariant?: ProductVariant | null
): boolean {
  if (selectedVariant) {
    return Boolean(selectedVariant.is_new);
  }
  if (product.variants && product.variants.length > 0) {
    return product.variants.some((v) => Boolean(v.is_new));
  }
  return Boolean(product.isNewArrival);
}

/**
 * Returns the unit selling price for a cart item:
 * Uses the selected variant price if present, otherwise product price.
 */
export function getCartItemUnitPrice(item: CartItem): number {
  if (item.selectedVariant) {
    return getVariantEffectivePrice(item.selectedVariant);
  }
  return getProductEffectivePrice(item.product);
}

/**
 * Returns the normal price for a cart item:
 */
export function getCartItemNormalPrice(item: CartItem): number {
  if (item.selectedVariant) {
    return getVariantNormalPrice(item.selectedVariant);
  }
  return getProductNormalPrice(item.product);
}
