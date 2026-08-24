import { CATEGORIES } from './categories';
import { PRODUCTS } from './products';
import { Category, Brand, Product } from '../types';

export const MOCK_CATEGORIES = CATEGORIES.map((cat, index) => ({
  id: cat.id,
  name: cat.name,
  slug: cat.slug || cat.id,
  description: cat.description || null,
  image_url: cat.heroImage || null,
  sort_order: index + 1,
  is_active: true,
  story: cat.story || '',
}));

const uniqueBrandNames = Array.from(new Set(PRODUCTS.map((p) => p.brand).filter(Boolean)));

export const MOCK_BRANDS: Brand[] = uniqueBrandNames.map((brandName, idx) => ({
  id: `brand-${idx + 1}`,
  name: brandName,
  slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  description: `${brandName} - 來自澳洲的純淨自然生活與工藝品牌。`,
  img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
  logo_url: null,
  is_active: true,
}));

export const MOCK_PRODUCTS = PRODUCTS;

export function getHydratedMockProducts(): any[] {
  return PRODUCTS.map((prod) => {
    const brandObj = MOCK_BRANDS.find((b) => b.name === prod.brand) || {
      id: prod.brand,
      name: prod.brand,
      slug: prod.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };

    const categoryObj = CATEGORIES.find(
      (c) => c.id === prod.categoryId || c.slug === prod.categoryId || c.name === prod.categoryName
    ) || {
      id: prod.categoryId,
      name: prod.categoryName || '選品',
      slug: prod.categoryId,
    };

    // Generate variants if options exist
    const variants: any[] = [];
    if (prod.options && prod.options.length > 0) {
      const primaryOption = prod.options[0];
      primaryOption.values.forEach((val, vIdx) => {
        variants.push({
          id: `${prod.id}-v${vIdx + 1}`,
          product_id: prod.id,
          name: `${prod.name} (${val})`,
          weight: prod.weight ? parseFloat(prod.weight) || null : null,
          price: prod.price,
          original_price: prod.originalPrice || null,
          clearance_price: prod.isClearance ? prod.price : null,
          is_new: Boolean(prod.isNewArrival),
          is_sale: Boolean(prod.isClearance),
          option_values: { [primaryOption.name]: val },
          is_active: true,
        });
      });
    }

    return {
      id: prod.id,
      name: prod.name,
      name_en: prod.name,
      description: prod.description,
      brand_id: brandObj.id,
      brand_name: prod.brand,
      category_id: categoryObj.id,
      category_name: categoryObj.name,
      category_slug: categoryObj.slug,
      price: prod.price,
      original_price: prod.originalPrice || null,
      clearance_price: prod.isClearance ? prod.price : (prod.clearancePrice || null),
      img: prod.imageUrl,
      image_url: prod.imageUrl,
      hover_img: prod.hoverImageUrl || prod.imageUrl,
      hoverImageUrl: prod.hoverImageUrl || prod.imageUrl,
      weight: prod.weight ? parseFloat(prod.weight) || null : null,
      expiry_date: prod.expiryDate || null,
      origin: prod.origin || 'Australia',
      ingredients: prod.ingredientsOrMaterials || [],
      scent_notes: prod.tags || [],
      tags: prod.tags || [],
      is_active: prod.inStock !== false,
      is_new: Boolean(prod.isNewArrival),
      is_sale: Boolean(prod.isClearance),
      options: prod.options || [],
      features: prod.features || [],
      rating: prod.rating || 4.8,
      review_count: prod.reviewCount || 15,
      categories: {
        id: categoryObj.id,
        name: categoryObj.name,
        slug: categoryObj.slug,
      },
      brands: {
        id: brandObj.id,
        name: brandObj.name,
        slug: brandObj.slug,
      },
      product_variants: variants,
    };
  });
}
