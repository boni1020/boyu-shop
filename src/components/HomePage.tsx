import React, { useMemo, useCallback } from 'react';
import { Category, CategoryId, Product } from '../types';
import { useCategories } from '../context/CategoryContext';
import { ProductSection } from './ProductSection';
import { PackageOpen } from 'lucide-react';

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

  // Helper to sort products by created_at DESC, then by id for stable order
  const sortByCreatedAtDesc = useCallback((list: Product[]): Product[] => {
    return [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return a.id.localeCompare(b.id);
    });
  }, []);

  // 統一的分類商品取得函式 (所有分類一視同仁)
  // 嚴格規則：只有該分類在商品資料庫實際存在符合條件且已上架 (isActive !== false) 的商品才回傳
  // 絕不使用 fallback、不拿其他分類或最新商品填補
  const getProductsForCategory = useCallback(
    (category: Category): Product[] => {
      const matched = allProducts.filter((product) => {
        if (product.isActive === false) return false;
        return isProductInCategory(product, category);
      });
      return sortByCreatedAtDesc(matched).slice(0, 5);
    },
    [allProducts, isProductInCategory, sortByCreatedAtDesc]
  );

  // 統一計算所有有商品的分類 sections
  // 僅當 category.is_active !== false 且 products.length > 0 時才納入顯示列表
  // 若該分類目前無任何商品 (products.length === 0)，則該 Section 絕不渲染
  const activeSections = useMemo(() => {
    return categories
      .filter((cat) => cat.is_active !== false)
      .map((cat) => ({
        category: cat,
        products: getProductsForCategory(cat),
      }))
      .filter((section) => section.products.length > 0);
  }, [categories, getProductsForCategory]);

  return (
    <div className="w-full pb-16 bg-[#F6F3EA]">
      {allProducts.length === 0 ? (
        /* 當尚未放入 products.json 或商品為空時的友善提示區塊，防止白屏 */
        <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-in fade-in duration-300">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#438DB8]/10 text-[#438DB8] flex items-center justify-center">
            <PackageOpen className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#263B3F] font-serif-brand mb-2.5">
            商品資料庫準備就緒
          </h2>
          <p className="text-xs sm:text-sm text-[#263B3F]/70 max-w-md mx-auto leading-relaxed mb-4">
            官網商品讀取架構已全面切換為本地 JSON 模式。<br />
            請將商品 JSON 放置於 <code className="px-1.5 py-0.5 bg-white rounded-md border border-[#263B3F]/15 font-mono text-xs text-[#438DB8] font-semibold">src/data/products.json</code>，系統即會自動載入各分類商品與即時呈現。
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#263B3F]/10 text-[11px] text-[#263B3F]/60">
            <span>支援規格切換 ∙ 零成本欄位 ∙ 嚴格真實價格展示</span>
          </div>
        </div>
      ) : (
        activeSections.map(({ category, products }) => (
          <ProductSection
            key={category.id || category.slug || category.name}
            title={category.name}
            products={products}
            onMoreClick={() => onSelectCategory(category.id as CategoryId)}
            onSelectProduct={onSelectProduct}
            sectionId={`section-${category.slug || category.id}`}
          />
        ))
      )}
    </div>
  );
};

