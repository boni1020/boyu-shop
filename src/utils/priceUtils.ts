import { Product, ProductVariant, CartItem } from '../types';

/**
 * Returns the actual selling price for a variant:
 * - is_sale === true -> clearance_price (fallback to price if clearance_price is null)
 * - is_sale === false -> price
 * Directly uses precomputed prices from JSON without dynamic recalculation.
 */
export function getVariantEffectivePrice(variant: ProductVariant): number {
  if (variant.is_sale && variant.clearance_price != null) {
    return Number(variant.clearance_price);
  }
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
 * Returns whether the active variant (or product) is marked as on sale.
 * Returns true if:
 * 1. The selected variant has is_sale === true
 * 2. Or any variant in product.variants has is_sale === true
 * 3. Or product itself has isClearance === true
 * 4. Or product belongs to '限時特價' category (categoryName === '限時特價' or categoryId/slug === 'sale' or 'clearance')
 * Note: Having clearance_price alone does NOT make a product on sale.
 */
export function isItemOnSale(
  product: Product,
  selectedVariant?: ProductVariant | null
): boolean {
  if (selectedVariant) {
    return Boolean(selectedVariant.is_sale);
  }
  const hasVariantSale = Boolean(
    product.variants && product.variants.some((v) => Boolean(v.is_sale))
  );
  const isProductLevelSale = Boolean(
    product.isClearance ||
    product.categoryName === '限時特價' ||
    product.categorySlug === 'sale' ||
    product.categorySlug === 'clearance' ||
    product.categoryId === 'sale' ||
    product.categoryId === 'clearance'
  );
  return hasVariantSale || isProductLevelSale;
}

/**
 * Returns whether the active variant (or product) is marked as new.
 * Returns true if:
 * 1. The selected variant has is_new === true
 * 2. Or any variant in product.variants has is_new === true
 * 3. Or product itself has isNewArrival === true
 * 4. Or product belongs to '新品上市' category
 */
export function isItemNew(
  product: Product,
  selectedVariant?: ProductVariant | null
): boolean {
  if (selectedVariant) {
    return Boolean(selectedVariant.is_new);
  }
  const hasVariantNew = Boolean(
    product.variants && product.variants.some((v) => Boolean(v.is_new))
  );
  const isProductLevelNew = Boolean(
    product.isNewArrival ||
    product.categoryName === '新品上市' ||
    product.categorySlug === 'new-arrivals' ||
    product.categoryId === 'new-arrivals'
  );
  return hasVariantNew || isProductLevelNew;
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
