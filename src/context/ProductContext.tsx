import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, Brand, Category, CategoryId, ProductVariant } from '../types';
import { supabase } from '../services/supabase';
import { matchesCategory } from '../utils/filterUtils';

interface ProductContextType {
  products: Product[];
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getBrandByIdOrSlug: (idOrSlug: string) => Brand | undefined;
  getBrandsForCategory: (category: Category | string) => string[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Helper to normalize Supabase product into frontend Product type
function mapSupabaseProduct(raw: any): Product {
  const brandName = raw.brands?.name || raw.brand_name || raw.brand || '澳洲選品';
  const categoryName = raw.categories?.name || raw.category_name || '';
  const categorySlug = raw.categories?.slug || raw.category_slug || '';
  const categoryId = raw.category_id || raw.categories?.id || raw.categoryId || '';

  const isNew = Boolean(raw.is_new ?? raw.isNewArrival);
  const isSale = Boolean(raw.is_sale ?? raw.isClearance);

  // Map variants if available (support both product_variants and variants fields)
  const rawVariantList = raw.product_variants || raw.variants;
  const variants: ProductVariant[] = Array.isArray(rawVariantList)
    ? rawVariantList.map((v: any) => ({
        id: String(v.id),
        product_id: String(v.product_id),
        name: v.name || '',
        weight:
          v.weight != null
            ? typeof v.weight === 'number'
              ? v.weight
              : Number(v.weight)
            : null,
        price: typeof v.price === 'number' ? v.price : Number(v.price) || 0,
        clearance_price:
          v.clearance_price != null
            ? typeof v.clearance_price === 'number'
              ? v.clearance_price
              : Number(v.clearance_price)
            : null,
        is_new: Boolean(v.is_new),
        is_sale: Boolean(v.is_sale),
        option_values:
          v.option_values && typeof v.option_values === 'object' ? v.option_values : null,
      }))
    : [];

  const primaryVariant = variants.length > 0 ? variants[0] : null;

  // Normal price
  const price = primaryVariant
    ? primaryVariant.price
    : (typeof raw.price === 'number'
        ? raw.price
        : Number(raw.price) || 0);

  const clearancePrice = primaryVariant
    ? (primaryVariant.clearance_price != null ? primaryVariant.clearance_price : undefined)
    : (raw.clearance_price != null
        ? typeof raw.clearance_price === 'number'
          ? raw.clearance_price
          : Number(raw.clearance_price)
        : undefined);

  const hasSaleVariant = variants.some((v) => v.is_sale);
  const hasNewVariant = variants.some((v) => v.is_new);

  const finalIsNew = variants.length > 0 ? hasNewVariant : isNew;
  const finalIsSale = variants.length > 0 ? hasSaleVariant : isSale;

  // Prioritize primaryVariant.image, then raw.image from Supabase
  const imageUrl =
    (primaryVariant && primaryVariant.image) ||
    raw.image ||
    raw.image_url ||
    raw.imageUrl ||
    raw.img ||
    '';

  const hoverImageUrl =
    (variants.length > 1 && variants[1].image) ||
    raw.hover_image ||
    raw.hover_img ||
    raw.hoverImageUrl ||
    imageUrl;

  const tags: string[] = [];
  if (finalIsNew) tags.push('新品上市');
  if (finalIsSale) tags.push('清倉特價');
  if (categoryName) tags.push(categoryName);
  if (brandName && !tags.includes(brandName)) tags.push(brandName);

  const weightStr =
    primaryVariant && primaryVariant.weight != null
      ? `${primaryVariant.weight} kg`
      : raw.weight != null
      ? typeof raw.weight === 'number'
        ? `${raw.weight} kg`
        : String(raw.weight)
      : undefined;

  const originStr = (raw.origin || '澳洲 Australia').trim();

  return {
    id: String(raw.id),
    name: raw.name || '未命名商品',
    brand: brandName,
    brandId: raw.brand_id ? String(raw.brand_id) : undefined,
    categoryId: categoryId as CategoryId,
    categoryName,
    categorySlug,
    price,
    clearancePrice,
    imageUrl,
    hoverImageUrl,
    description: raw.description ? String(raw.description) : '',
    shortDescription: raw.description,
      // ? raw.description.length > 50
      //   ? raw.description.slice(0, 50) + '...'
      //   : raw.description
      // : (brandName ? `${brandName} 嚴選品質` : ''),
    origin: originStr,
    tags,
    inStock: raw.is_active !== false,
    isActive: raw.is_active !== false,
    isNewArrival: finalIsNew,
    isClearance: finalIsSale,
    createdAt: raw.created_at || raw.createdAt || undefined,
    variants,
    weight: weightStr,
    shelfLife: raw.expiry_date || undefined,
    expiryDate: raw.expiry_date || undefined,
    options: Array.isArray(raw.options) ? raw.options : undefined,
    specifications: raw.specifications || undefined,
    features: Array.isArray(raw.features) ? raw.features : undefined,
    ingredientsOrMaterials: Array.isArray(raw.ingredients) ? raw.ingredients : undefined,
    rating: typeof raw.rating === 'number' ? raw.rating : 4.8,
    reviewCount: typeof raw.review_count === 'number' ? raw.review_count : 12,
    rawSupabaseData: raw,
  };
}

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error('Supabase client 未初始化，請確認 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY 設定');
      }

      // Fetch products, product variants, product options, and brands in parallel directly from Supabase
      const [productsRes, variantsRes, optionsRes, brandsRes] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            categories (*),
            brands (*)
          `)
          .eq('is_active', true),
        supabase
          .from('product_variants')
          .select(`
            id,
            product_id,
            name,
            weight,
            price,
            clearance_price,
            is_new,
            is_sale,
            option_values,
            image,
            expiry_date,
            is_active
          `)
          .eq('is_active', true),
        supabase
          .from('product_options')
          .select('*')
          .then(
            (res) => {
              if (res.error) {
                console.warn('Supabase product_options fetch warning:', res.error);
                return { data: [] };
              }
              return res;
            },
            (err) => {
              console.warn('Supabase product_options network error:', err);
              return { data: [] };
            }
          ),
        supabase
          .from('brands')
          .select('*')
          .eq('is_active', true),
      ]);

      if (productsRes.error) {
        console.error('Supabase products query failed:', productsRes.error);
        throw new Error(`無法取得商品資料: ${productsRes.error.message}`);
      }
      if (variantsRes.error) {
        console.warn('Supabase product_variants query warning:', variantsRes.error);
      }
      if (brandsRes.error) {
        console.error('Supabase brands query failed:', brandsRes.error);
        throw new Error(`無法取得品牌資料: ${brandsRes.error.message}`);
      }

      const rawProducts = productsRes.data || [];
      const rawVariants = variantsRes.data || [];
      const rawOptions = (optionsRes as any)?.data || [];
      const rawBrands = brandsRes.data || [];

      // Group variants by product_id
      const variantsByProductId = new Map<string, any[]>();
      for (const variant of rawVariants) {
        const pId = String(variant.product_id);
        if (!variantsByProductId.has(pId)) {
          variantsByProductId.set(pId, []);
        }
        variantsByProductId.get(pId)!.push({
          id: String(variant.id),
          product_id: String(variant.product_id),
          name: variant.name || '',
          weight: variant.weight != null ? Number(variant.weight) : null,
          price: variant.price != null ? Number(variant.price) : 0,
          clearance_price: variant.clearance_price != null ? Number(variant.clearance_price) : null,
          is_new: Boolean(variant.is_new),
          is_sale: Boolean(variant.is_sale),
          option_values: variant.option_values || null,
          image: variant.image || null,
          expiry_date: variant.expiry_date || null,
        });
      }

      // Group options by product_id
      const optionsByProductId = new Map<string, any[]>();
      for (const opt of rawOptions) {
        const pId = String(opt.product_id);
        if (!optionsByProductId.has(pId)) {
          optionsByProductId.set(pId, []);
        }

        const optName = opt.name || '';
        let optValues: string[] = [];
        if (Array.isArray(opt.values) && opt.values.length > 0) {
          optValues = opt.values.filter(Boolean).map(String);
        } else {
          const productVariants = variantsByProductId.get(pId) || [];
          const extractedValues = new Set<string>();
          for (const v of productVariants) {
            if (v.option_values && v.option_values[optName]) {
              extractedValues.add(String(v.option_values[optName]));
            } else if (v.name) {
              extractedValues.add(String(v.name));
            }
          }
          optValues = Array.from(extractedValues);
        }

        optionsByProductId.get(pId)!.push({
          name: optName,
          values: optValues,
        });
      }

      // Hydrate raw products with their variants and options
      const hydratedRawProducts = rawProducts.map((prod: any) => ({
        ...prod,
        id: String(prod.id),
        name: prod.name || '',
        description: prod.description || null,
        brand_id: prod.brand_id ? String(prod.brand_id) : null,
        category_id: prod.category_id ? String(prod.category_id) : null,
        price: prod.price != null ? Number(prod.price) : null,
        clearance_price: prod.clearance_price != null ? Number(prod.clearance_price) : null,
        image: prod.image || prod.img || prod.image_url || null,
        img: prod.image || prod.img || null,
        hover_img: prod.hover_img || null,
        weight: prod.weight != null ? Number(prod.weight) : null,
        expiry_date: prod.expiry_date || null,
        origin: prod.origin || null,
        is_active: Boolean(prod.is_active),
        is_new: Boolean(prod.is_new),
        is_sale: Boolean(prod.is_sale),
        categories: prod.categories || null,
        brands: prod.brands || null,
        product_variants: variantsByProductId.get(String(prod.id)) || [],
        options: optionsByProductId.get(String(prod.id)) || (Array.isArray(prod.options) ? prod.options : []),
      }));

      const formattedProducts = hydratedRawProducts.map(mapSupabaseProduct);
      const formattedBrands: Brand[] = rawBrands.map((b: any) => ({
        id: String(b.id),
        name: b.name,
        slug: b.slug || String(b.id),
        description: b.description || null,
        img: b.img || null,
        logo_url: b.img || null,
        is_active: b.is_active ?? true,
      }));

      console.log('[Supabase] products', formattedProducts);
      console.log('[Supabase] brands', formattedBrands);
      console.log('[Supabase] variants', rawVariants);
      console.log('[Supabase] options', rawOptions);

      setProducts(formattedProducts);
      setBrands(formattedBrands);
    } catch (err: any) {
      console.error('Failed to fetch products/brands from Supabase:', err);
      setError(err?.message || '無法從 Supabase 取得商品或品牌資料');
      // STRICT: No fake data fallback. Empty array on error.
      setProducts([]);
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getProductById = useCallback(
    (id: string): Product | undefined => {
      if (!id) return undefined;
      return products.find((p) => String(p.id) === String(id));
    },
    [products]
  );

  const getBrandByIdOrSlug = useCallback(
    (idOrSlug: string): Brand | undefined => {
      if (!idOrSlug) return undefined;
      const target = idOrSlug.toLowerCase();
      return brands.find(
        (b) =>
          String(b.id) === String(idOrSlug) ||
          b.slug?.toLowerCase() === target ||
          b.name.toLowerCase() === target
      );
    },
    [brands]
  );

  // Dynamic brand list calculation for a specific category
  const getBrandsForCategory = useCallback(
    (category: Category | string): string[] => {
      const categoryProducts = products.filter((p) => matchesCategory(p, category));

      const uniqueBrands = new Set<string>();
      categoryProducts.forEach((p) => {
        if (p.brand && p.brand.trim()) {
          uniqueBrands.add(p.brand.trim());
        }
      });

      return Array.from(uniqueBrands).sort();
    },
    [products]
  );

  const value = useMemo(
    () => ({
      products,
      brands,
      isLoading,
      error,
      refetch: fetchData,
      getProductById,
      getBrandByIdOrSlug,
      getBrandsForCategory,
    }),
    [products, brands, isLoading, error, fetchData, getProductById, getBrandByIdOrSlug, getBrandsForCategory]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
