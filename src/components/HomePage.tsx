import React, { useMemo } from 'react';
import { Category, CategoryId, Product } from '../types';
import { useCategories } from '../context/CategoryContext';
import { isItemOnSale } from '../utils/priceUtils';
import { ProductSection } from './ProductSection';

interface HomePageProps {
  allProducts: Product[];
  onSelectCategory: (categoryId: CategoryId) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  allProducts,
  onSelectCategory,
  onSelectProduct,
}) => {
  const { categories, isProductInCategory } = useCategories();

  // Helper to sort products by created_at DESC
  const sortByCreatedAtDesc = (list: Product[]): Product[] => {
    return [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.rawSupabaseData?.created_at || 0).getTime();
      const timeB = new Date(b.createdAt || b.rawSupabaseData?.created_at || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return a.id.localeCompare(b.id);
    });
  };

  // Find category entities
  const newArrivalsCat = useMemo(
    () => categories.find((c) => c.type === 'new' || c.name === '新品上市' || c.id === 'new-arrivals'),
    [categories]
  );
  const lifeCat = useMemo(
    () => categories.find((c) => c.name === '生活補給' || c.slug === 'life' || c.slug === 'life-supplies'),
    [categories]
  );
  const beautyCat = useMemo(
    () => categories.find((c) => c.name === '精選美研' || c.slug === 'beauty' || c.slug === 'skincare'),
    [categories]
  );
  const accessoriesCat = useMemo(
    () => categories.find((c) => c.name === '舒適配飾' || c.slug === 'accessories'),
    [categories]
  );
  const essentialsCat = useMemo(
    () => categories.find((c) => c.name === '日之選用' || c.slug === 'essentials' || c.slug === 'home'),
    [categories]
  );
  const foodCat = useMemo(
    () => categories.find((c) => c.name === '食光選物' || c.slug === 'food' || c.slug === 'food-pantry'),
    [categories]
  );
  const saleCat = useMemo(
    () => categories.find((c) => c.type === 'sale' || c.name === '限時特價' || c.id === 'sale'),
    [categories]
  );

  // 1. 最新商品 (新品上市) - 依 created_at DESC 排序只取 5 筆
  const newArrivalProducts = useMemo(() => {
    const activeProducts = allProducts.filter((p) => p.isActive !== false);
    return sortByCreatedAtDesc(activeProducts).slice(0, 5);
  }, [allProducts]);

  // Helper for category products (latest 5)
  const getCategoryProducts = (catName: string, catObj?: Category) => {
    const matched = allProducts.filter((p) => {
      if (p.isActive === false) return false;
      if (catObj && isProductInCategory(p, catObj)) return true;
      return p.categoryName === catName;
    });
    return sortByCreatedAtDesc(matched).slice(0, 5);
  };

  // 2. 生活補給 - category =「生活補給」最新 5 個
  const lifeProducts = useMemo(() => {
    return getCategoryProducts('生活補給', lifeCat);
  }, [allProducts, lifeCat, isProductInCategory]);

  // 3. 精選美研 - category =「精選美研」最新 5 個
  const beautyProducts = useMemo(() => {
    return getCategoryProducts('精選美研', beautyCat);
  }, [allProducts, beautyCat, isProductInCategory]);

  // 4. 舒適配飾 - category =「舒適配飾」最新 5 個
  const accessoriesProducts = useMemo(() => {
    return getCategoryProducts('舒適配飾', accessoriesCat);
  }, [allProducts, accessoriesCat, isProductInCategory]);

  // 5. 日之選用 - category =「日之選用」最新 5 個
  const essentialsProducts = useMemo(() => {
    return getCategoryProducts('日之選用', essentialsCat);
  }, [allProducts, essentialsCat, isProductInCategory]);

  // 6. 食光選物 - category =「食光選物」最新 5 個
  const foodProducts = useMemo(() => {
    return getCategoryProducts('食光選物', foodCat);
  }, [allProducts, foodCat, isProductInCategory]);

  // 7. 限時特價 - is_sale = true 依 created_at DESC 排序只取 5 個
  const saleProducts = useMemo(() => {
    const saleList = allProducts.filter((p) => {
      if (p.isActive === false) return false;
      return Boolean(
        p.isClearance ||
        p.rawSupabaseData?.is_sale ||
        (saleCat && isProductInCategory(p, saleCat)) ||
        isItemOnSale(p)
      );
    });
    return sortByCreatedAtDesc(saleList).slice(0, 5);
  }, [allProducts, saleCat, isProductInCategory]);

  return (
    <div className="w-full pb-16 bg-[#F6F3EA]">
      {/* 1. 新品上市 */}
      <ProductSection
        title="新品上市"
        products={newArrivalProducts}
        onMoreClick={() => onSelectCategory((newArrivalsCat ? newArrivalsCat.id : 'new-arrivals') as CategoryId)}
        onSelectProduct={onSelectProduct}
        sectionId="section-new-arrivals"
      />

      {/* 2. 生活補給 */}
      <ProductSection
        title="生活補給"
        products={lifeProducts}
        onMoreClick={() => onSelectCategory((lifeCat ? lifeCat.id : 'life') as CategoryId)}
        onSelectProduct={onSelectProduct}
        sectionId="section-life"
      />

      {/* 3. 精選美研 */}
      <ProductSection
        title="精選美研"
        products={beautyProducts}
        onMoreClick={() => onSelectCategory((beautyCat ? beautyCat.id : 'beauty') as CategoryId)}
        onSelectProduct={onSelectProduct}
        sectionId="section-beauty"
      />

      {/* 4. 舒適配飾 */}
      <ProductSection
        title="舒適配飾"
        products={accessoriesProducts}
        onMoreClick={() => onSelectCategory((accessoriesCat ? accessoriesCat.id : 'accessories') as CategoryId)}
        onSelectProduct={onSelectProduct}
        sectionId="section-accessories"
      />

      {/* 5. 日之選用 */}
      <ProductSection
        title="日之選用"
        products={essentialsProducts}
        onMoreClick={() => onSelectCategory((essentialsCat ? essentialsCat.id : 'essentials') as CategoryId)}
        onSelectProduct={onSelectProduct}
        sectionId="section-essentials"
      />

      {/* 6. 食光選物 */}
      <ProductSection
        title="食光選物"
        products={foodProducts}
        onMoreClick={() => onSelectCategory((foodCat ? foodCat.id : 'food-pantry') as CategoryId)}
        onSelectProduct={onSelectProduct}
        sectionId="section-food"
      />

      {/* 7. 限時特價 */}
      <ProductSection
        title="限時特價"
        products={saleProducts}
        onMoreClick={() => onSelectCategory((saleCat ? saleCat.id : 'sale') as CategoryId)}
        onSelectProduct={onSelectProduct}
        sectionId="section-sale"
      />
    </div>
  );
};
