import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Category, Product, CategoryType } from '../types';
import { matchesCategory } from '../utils/filterUtils';

interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getCategoryByIdOrSlug: (idOrSlug: string) => Category | undefined;
  isProductInCategory: (product: Product, categoryOrId: Category | string) => boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// 官網各分類代表性主題視覺與描述
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
  '限時特價': {
    hero: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1800&q=80',
    english: 'SPECIAL OFFERS',
    desc: '限量現貨倒數，專屬優惠探索澳洲純淨選品。',
  },
  '清倉特價': {
    hero: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1800&q=80',
    english: 'SPECIAL OFFERS',
    desc: '限量現貨倒數，專屬優惠探索澳洲純淨選品。',
  },
};

/**
 * 官網固定 7 大分類（純前端靜態定義，不再查詢 Supabase）
 */
export const OFFICIAL_CATEGORIES: Category[] = [
  {
    id: 'new-arrivals',
    name: '新品上市',
    slug: 'new-arrivals',
    type: 'new' as CategoryType,
    sort_order: 1,
    is_active: true,
    description: CATEGORY_DEFAULT_IMAGES['新品上市'].desc,
    englishName: CATEGORY_DEFAULT_IMAGES['新品上市'].english,
    story: '',
    heroImage: CATEGORY_DEFAULT_IMAGES['新品上市'].hero,
    image_url: null,
  },
  {
    id: 'life',
    name: '生活補給',
    slug: 'life',
    type: 'regular' as CategoryType,
    sort_order: 2,
    is_active: true,
    description: CATEGORY_DEFAULT_IMAGES['生活補給'].desc,
    englishName: CATEGORY_DEFAULT_IMAGES['生活補給'].english,
    story: '',
    heroImage: CATEGORY_DEFAULT_IMAGES['生活補給'].hero,
    image_url: null,
  },
  {
    id: 'beauty',
    name: '精選美研',
    slug: 'beauty',
    type: 'regular' as CategoryType,
    sort_order: 3,
    is_active: true,
    description: CATEGORY_DEFAULT_IMAGES['精選美研'].desc,
    englishName: CATEGORY_DEFAULT_IMAGES['精選美研'].english,
    story: '',
    heroImage: CATEGORY_DEFAULT_IMAGES['精選美研'].hero,
    image_url: null,
  },
  {
    id: 'accessories',
    name: '舒適配飾',
    slug: 'accessories',
    type: 'regular' as CategoryType,
    sort_order: 4,
    is_active: true,
    description: CATEGORY_DEFAULT_IMAGES['舒適配飾'].desc,
    englishName: CATEGORY_DEFAULT_IMAGES['舒適配飾'].english,
    story: '',
    heroImage: CATEGORY_DEFAULT_IMAGES['舒適配飾'].hero,
    image_url: null,
  },
  {
    id: 'essentials',
    name: '日之選用',
    slug: 'essentials',
    type: 'regular' as CategoryType,
    sort_order: 5,
    is_active: true,
    description: CATEGORY_DEFAULT_IMAGES['日之選用'].desc,
    englishName: CATEGORY_DEFAULT_IMAGES['日之選用'].english,
    story: '',
    heroImage: CATEGORY_DEFAULT_IMAGES['日之選用'].hero,
    image_url: null,
  },
  {
    id: 'food-pantry',
    name: '食光選物',
    slug: 'food-pantry',
    type: 'regular' as CategoryType,
    sort_order: 6,
    is_active: true,
    description: CATEGORY_DEFAULT_IMAGES['食光選物'].desc,
    englishName: CATEGORY_DEFAULT_IMAGES['食光選物'].english,
    story: '',
    heroImage: CATEGORY_DEFAULT_IMAGES['食光選物'].hero,
    image_url: null,
  },
  {
    id: 'sale',
    name: '限時特價',
    slug: 'sale',
    type: 'sale' as CategoryType,
    sort_order: 7,
    is_active: true,
    description: CATEGORY_DEFAULT_IMAGES['限時特價'].desc,
    englishName: CATEGORY_DEFAULT_IMAGES['限時特價'].english,
    story: '',
    heroImage: CATEGORY_DEFAULT_IMAGES['限時特價'].hero,
    image_url: null,
  },
];

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(OFFICIAL_CATEGORIES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    // 靜態分類已直接載入，不再向 Supabase 發起網路請求
    setCategories(OFFICIAL_CATEGORIES);
    setIsLoading(false);
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
          c.name === idOrSlug ||
          (target === 'new' && (c.type === 'new' || c.slug === 'new-arrivals')) ||
          (target === 'new-arrivals' && (c.type === 'new' || c.slug === 'new-arrivals')) ||
          (target === 'sale' && (c.type === 'sale' || c.slug === 'sale')) ||
          (target === 'clearance' && (c.type === 'sale' || c.slug === 'sale'))
      );
    },
    [categories]
  );

  // Check if a product belongs to a given category
  const isProductInCategory = useCallback(
    (product: Product, categoryOrId: Category | string): boolean => {
      return matchesCategory(product, categoryOrId);
    },
    []
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
