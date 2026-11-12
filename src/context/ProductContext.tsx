import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, Brand, Category, CategoryId, ProductVariant, JsonProduct } from '../types';
import { matchesCategory } from '../utils/filterUtils';
import rawProductsData from '../data/products.json';

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

/**
 * 官網標準分類名稱與 ID / Slug 對應表
 */
const CATEGORY_MAP: Record<string, { id: CategoryId; slug: string }> = {
  '新品上市': { id: 'new-arrivals', slug: 'new-arrivals' },
  '生活補給': { id: 'life', slug: 'life' },
  '精選美研': { id: 'beauty', slug: 'beauty' },
  '舒適配飾': { id: 'accessories', slug: 'accessories' },
  '日之選用': { id: 'essentials', slug: 'essentials' },
  '食光選物': { id: 'food-pantry', slug: 'food-pantry' },
  '限時特價': { id: 'sale', slug: 'sale' },
  '清倉特價': { id: 'sale', slug: 'sale' },
};

/**
 * 將 JSON 商品格式轉換為前端商品展示型別 (Product)
 * 絕無成本、毛利、匯率或售價計算公式，直接讀取最終售價
 */
function mapJsonProduct(raw: JsonProduct): Product {
  const brandName = (raw.brand || '').trim() || '澳洲選品';
  const categoryName = (raw.category || '').trim();
  const categoryMeta = CATEGORY_MAP[categoryName] || {
    id: categoryName as CategoryId,
    slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
  };

  const isNew = Boolean(raw.is_new);
  const isSale = Boolean(raw.is_sale);

  // 規格 variants 映射（支援空陣列 []）
  const rawVariants = Array.isArray(raw.variants) ? raw.variants : [];
  const variants: ProductVariant[] = rawVariants.map((v) => ({
    id: String(v.id),
    product_id: String(raw.id),
    name: v.name || '',
    price: typeof v.price === 'number' ? v.price : Number(v.price) || 0,
    clearance_price:
      v.clearance_price != null
        ? typeof v.clearance_price === 'number'
          ? v.clearance_price
          : Number(v.clearance_price)
        : null,
    is_sale: Boolean(v.is_sale),
    is_new: isNew,
    image: v.image || null,
    weight:
      v.weight != null
        ? typeof v.weight === 'number'
          ? v.weight
          : Number(v.weight)
        : null,
    option_values: null,
    expiry_date:
      v.expiry_date != null && String(v.expiry_date).trim() !== ''
        ? String(v.expiry_date).trim()
        : null,
  }));

  const primaryVariant = variants.length > 0 ? variants[0] : null;

  // 最終售價：直接讀取 JSON 數值，不得重新計算
  const price = typeof raw.price === 'number' ? raw.price : Number(raw.price) || 0;
  const clearancePrice =
    raw.clearance_price != null
      ? typeof raw.clearance_price === 'number'
        ? raw.clearance_price
        : Number(raw.clearance_price)
      : undefined;

  const hasSaleVariant = variants.some((v) => v.is_sale);
  const finalIsSale = Boolean(isSale || hasSaleVariant);

  // 優先使用第一規格圖片，次為商品主圖
  const imageUrl =
    (primaryVariant && primaryVariant.image) ||
    raw.image ||
    '';

  const hoverImageUrl =
    (variants.length > 1 && variants[1].image) ||
    imageUrl;

  const tags: string[] = [];
  if (isNew) tags.push('新品上市');
  if (finalIsSale) tags.push('限時特價');
  if (categoryName) tags.push(categoryName);
  if (brandName && !tags.includes(brandName)) tags.push(brandName);

  const desc = raw.description ? String(raw.description).trim() : '';
  const productWeight =
    raw.weight != null
      ? typeof raw.weight === 'number'
        ? raw.weight
        : Number(raw.weight)
      : null;

  const expiryDate =
    raw.expiry_date != null && String(raw.expiry_date).trim() !== ''
      ? String(raw.expiry_date).trim()
      : desc && /有效期限|\d{4}\.\d{2}/.test(desc)
      ? desc
      : undefined;

  return {
    id: String(raw.id),
    name: raw.name || '未命名商品',
    brand: brandName,
    brandId: brandName.toLowerCase().replace(/\s+/g, '-'),
    categoryId: categoryMeta.id,
    categoryName,
    categorySlug: categoryMeta.slug,
    price,
    clearancePrice,
    imageUrl,
    hoverImageUrl,
    description: desc,
    shortDescription: desc,
    weight: productWeight,
    expiryDate,
    tags,
    inStock: true,
    isActive: true,
    isNewArrival: isNew,
    isClearance: finalIsSale,
    variants,
    options:
      variants.length > 0
        ? [
            {
              name: '規格',
              values: variants.map((v) => v.name).filter(Boolean),
            },
          ]
        : undefined,
    rating: 4.8,
    reviewCount: 12,
  };
}

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadLocalData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rawJsonList = (rawProductsData as unknown as JsonProduct[]) || [];

      if (!Array.isArray(rawJsonList)) {
        throw new Error('src/data/products.json 格式錯誤，根節點必須為 JSON 陣列');
      }

      if (rawJsonList.length === 0) {
        setProducts([]);
        setBrands([]);
        setIsLoading(false);
        return;
      }

      // 轉換商品資料
      const formattedProducts = rawJsonList.map(mapJsonProduct);

      // 動態萃取所有不重複品牌（從 JSON 資料本身產生，不額外查詢）
      const uniqueBrandsMap = new Map<string, Brand>();
      formattedProducts.forEach((p) => {
        if (p.brand && p.brand.trim() && !uniqueBrandsMap.has(p.brand.trim())) {
          const name = p.brand.trim();
          uniqueBrandsMap.set(name, {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            is_active: true,
            description: null,
            img: null,
            logo_url: null,
          });
        }
      });
      const formattedBrands = Array.from(uniqueBrandsMap.values());

      setProducts(formattedProducts);
      setBrands(formattedBrands);
    } catch (err: any) {
      console.error('載入本地 products.json 失敗:', err);
      setError(err?.message || '無法從本地 JSON 載入商品資料');
      setProducts([]);
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocalData();
  }, [loadLocalData]);

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

  // 動態計算某分類下的品牌清單
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
      refetch: loadLocalData,
      getProductById,
      getBrandByIdOrSlug,
      getBrandsForCategory,
    }),
    [products, brands, isLoading, error, loadLocalData, getProductById, getBrandByIdOrSlug, getBrandsForCategory]
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

