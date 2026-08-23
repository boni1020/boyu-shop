import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Category, Product } from '../types';

interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getCategoryByIdOrSlug: (idOrSlug: string) => Category | undefined;
  isProductInCategory: (product: Product, categoryOrId: Category | string) => boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Default curated aesthetic imagery for categories if Supabase image_url is empty
const CATEGORY_DEFAULT_IMAGES: Record<string, { hero: string; english: string; desc: string }> = {
  '新品上市': {
    hero: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=80',
    english: 'NEW ARRIVALS',
    desc: '每週空運抵台，發掘最新澳洲有機保養與療癒生活器物。',
  },
  '生活補給': {
    hero: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80',
    english: 'DAILY WELLNESS',
    desc: '澳洲大自然純淨植萃、草本機能補充與全家人安心守護。',
  },
  '精選美研': {
    hero: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1800&q=80',
    english: 'BEAUTY & SKINCARE',
    desc: '源自墨爾本純淨植萃精油，滋養每寸肌膚與心靈的日常儀式。',
  },
  '舒適配飾': {
    hero: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1800&q=80',
    english: 'NATURAL ACCESSORIES',
    desc: '100% 澳洲美麗諾頂級羊毛、天然織品與無負擔親膚選品。',
  },
  '日之選用': {
    hero: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80',
    english: 'HOME & LIFESTYLE',
    desc: '簡約純粹的生活道具，注入澳洲大地香氣與溫潤木質細節。',
  },
  '食光選物': {
    hero: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1800&q=80',
    english: 'FOOD & PANTRY',
    desc: '塔斯馬尼亞珍稀蜂蜜、野生堅果醬與無添加莊園美味。',
  },
  '清倉特價': {
    hero: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1800&q=80',
    english: 'SPECIAL CLEARANCE',
    desc: '限量現貨倒數，專屬優惠探索澳洲純淨選品。',
  },
};

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`伺服器回應錯誤 (${response.status})`);
      }
      const rawData = await response.json();

      if (!Array.isArray(rawData)) {
        throw new Error('回傳之分類資料格式不符');
      }

      const formattedCategories: Category[] = rawData.map((item: any) => {
        const fallbackMeta = CATEGORY_DEFAULT_IMAGES[item.name] || {
          hero: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80',
          english: item.slug ? item.slug.toUpperCase() : 'AUSTRALIAN LIVING',
          desc: '來自澳洲海岸與陽光森林的純淨生活選物。',
        };

        return {
          id: String(item.id),
          name: item.name,
          slug: item.slug || String(item.id),
          sort_order: item.sort_order ?? 0,
          is_active: item.is_active ?? true,
          description: item.description || fallbackMeta.desc,
          englishName: fallbackMeta.english || (item.slug ? item.slug.toUpperCase() : item.name),
          story: item.story || '',
          heroImage: item.image_url || fallbackMeta.hero,
          image_url: item.image_url || null,
        };
      });

      setCategories(formattedCategories);
    } catch (err: any) {
      console.error('Failed to fetch categories from Supabase:', err);
      setError(err?.message || '無法從 Supabase 取得分類資料');
      // STRICT: No fake data fallback. Empty categories array on error.
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Find category by Supabase UUID, slug, or name
  const getCategoryByIdOrSlug = useCallback(
    (idOrSlug: string): Category | undefined => {
      if (!idOrSlug) return undefined;
      const target = idOrSlug.toLowerCase();
      return categories.find(
        (c) =>
          c.id === idOrSlug ||
          c.slug?.toLowerCase() === target ||
          c.name === idOrSlug
      );
    },
    [categories]
  );

  // Check if a product belongs to a given category
  const isProductInCategory = useCallback(
    (product: Product, categoryOrId: Category | string): boolean => {
      if (!product || !categoryOrId) return false;

      let category: Category | undefined;
      if (typeof categoryOrId === 'string') {
        category = getCategoryByIdOrSlug(categoryOrId);
      } else {
        category = categoryOrId;
      }

      if (!category) {
        return (
          product.categoryId === categoryOrId ||
          product.categoryName === categoryOrId
        );
      }

      // Check by category name match
      if (product.categoryName && category.name && product.categoryName === category.name) {
        return true;
      }

      // Check by direct ID or slug match
      if (
        product.categoryId === category.id ||
        product.categoryId === category.slug ||
        product.categorySlug === category.slug
      ) {
        return true;
      }

      return false;
    },
    [getCategoryByIdOrSlug]
  );

  const value = useMemo(
    () => ({
      categories,
      isLoading,
      error,
      refetch: fetchCategories,
      getCategoryByIdOrSlug,
      isProductInCategory,
    }),
    [categories, isLoading, error, fetchCategories, getCategoryByIdOrSlug, isProductInCategory]
  );

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};

export const useCategories = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
