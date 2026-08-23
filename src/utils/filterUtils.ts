import { Product, CategoryId, BrandStats, Category } from '../types';
import { getProductEffectivePrice, isItemOnSale, isItemNew } from './priceUtils';

export function matchesCategory(
  product: Product,
  categoryOrId: Category | CategoryId | 'all'
): boolean {
  if (categoryOrId === 'all') return true;
  if (!categoryOrId || !product) return false;

  let catId = '';
  let catName = '';
  let catSlug = '';

  if (typeof categoryOrId === 'string') {
    catId = categoryOrId;
    catName = categoryOrId;
    catSlug = categoryOrId.toLowerCase();
  } else {
    catId = categoryOrId.id || '';
    catName = categoryOrId.name || '';
    catSlug = (categoryOrId.slug || '').toLowerCase();
  }

  // 1. Direct ID / UUID match
  if (product.categoryId && catId && product.categoryId === catId) return true;

  // 2. Direct Name match
  if (product.categoryName && catName && product.categoryName === catName) return true;

  // 3. Slug match
  if (product.categorySlug && catSlug && product.categorySlug.toLowerCase() === catSlug) return true;
  if (product.categoryId && catSlug && product.categoryId.toLowerCase() === catSlug) return true;

  // 4. Special category handling
  if (catSlug === 'new' || catSlug === 'new-arrivals' || catName.includes('新品')) {
    return isItemNew(product);
  }
  if (catSlug === 'sale' || catSlug === 'clearance' || catName.includes('清倉') || catName.includes('特價')) {
    return isItemOnSale(product);
  }

  return false;
}

/**
 * Dynamically extract unique brands and their product counts for a specific category.
 * This guarantees brands are not hardcoded and update dynamically when products are added.
 */
export function getBrandsForCategory(
  products: Product[],
  categoryId: CategoryId | Category | 'all'
): BrandStats[] {
  // Filter products by category first if not 'all'
  const categoryProducts =
    categoryId === 'all'
      ? products
      : products.filter((product) => matchesCategory(product, categoryId));

  const brandCounts: Record<string, number> = {};

  categoryProducts.forEach((product) => {
    if (product.brand) {
      brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
    }
  });

  // Sort alphabetically or by count
  return Object.entries(brandCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
}

/**
 * Filter products by category AND brand, with optional search query and sorting.
 * Strictly adheres to:
 * category = selectedCategory AND brand = selectedBrand (if brand !== 'all')
 */
export function filterProducts(
  products: Product[],
  options: {
    category?: Category;
    categoryId?: CategoryId | Category | 'all';
    brand?: string; // 'all' or specific brand name
    searchQuery?: string;
    sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  }
): Product[] {
  const {
    category,
    categoryId = 'all',
    brand = 'all',
    searchQuery = '',
    sortBy = 'featured',
  } = options;

  let result = [...products];

  const targetCategory = category || categoryId;

  // 1. Filter by category
  if (targetCategory !== 'all') {
    result = result.filter((p) => matchesCategory(p, targetCategory));
  }

  // 2. Filter by brand (Strict: only matches within the selected category)
  if (brand && brand !== 'all') {
    result = result.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  // 3. Filter by search query if provided
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchOrigin = p.origin.toLowerCase().includes(q);
      const matchShortDesc = p.shortDescription.toLowerCase().includes(q);
      const matchTags = p.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchFeatures = p.features?.some((f) => f.toLowerCase().includes(q));
      return matchName || matchBrand || matchOrigin || matchShortDesc || matchTags || matchFeatures;
    });
  }

  // 4. Sorting
  if (sortBy === 'price-asc') {
    result.sort((a, b) => getProductEffectivePrice(a) - getProductEffectivePrice(b));
  } else if (sortBy === 'price-desc') {
    result.sort((a, b) => getProductEffectivePrice(b) - getProductEffectivePrice(a));
  } else if (sortBy === 'newest') {
    result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
  }

  return result;
}

/**
 * Search all products globally (for Header search & search page)
 */
export function searchGlobalProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    const matchName = p.name.toLowerCase().includes(q);
    const matchBrand = p.brand.toLowerCase().includes(q);
    const matchCategory = p.categoryName.toLowerCase().includes(q);
    const matchDesc = p.description.toLowerCase().includes(q);
    const matchShortDesc = p.shortDescription.toLowerCase().includes(q);
    const matchTags = p.tags.some((tag) => tag.toLowerCase().includes(q));
    const matchOrigin = p.origin.toLowerCase().includes(q);
    return (
      matchName ||
      matchBrand ||
      matchCategory ||
      matchDesc ||
      matchShortDesc ||
      matchTags ||
      matchOrigin
    );
  });
}
