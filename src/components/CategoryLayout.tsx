import React, { useState, useMemo } from 'react';
import { Category, Product, CategoryId } from '../types';
import { BrandFilter } from './BrandFilter';
import { ProductCard } from './ProductCard';
import { getBrandsForCategory, filterProducts, matchesCategory } from '../utils/filterUtils';
import {
  ChevronRight,
  ArrowUpDown,
  X,
  Sparkles,
  Compass,
} from 'lucide-react';

interface CategoryLayoutProps {
  category: Category;
  allProducts: Product[];
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateHome: () => void;
  onSelectCategory: (catId: CategoryId) => void;
}

export const CategoryLayout: React.FC<CategoryLayoutProps> = ({
  category,
  allProducts,
  selectedBrand,
  onSelectBrand,
  onSelectProduct,
  onNavigateHome,
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // 1. Calculate brands dynamically for this specific category
  const dynamicBrands = useMemo(() => {
    return getBrandsForCategory(allProducts, category);
  }, [allProducts, category]);

  // 2. Filter products: category AND brand == selectedBrand (if !== 'all')
  const filteredProducts = useMemo(() => {
    return filterProducts(allProducts, {
      category,
      categoryId: category.id,
      brand: selectedBrand,
      sortBy,
    });
  }, [allProducts, category, selectedBrand, sortBy]);

  // Total products in this category (unfiltered by brand)
  const totalCategoryProductsCount = useMemo(() => {
    return allProducts.filter((p) => matchesCategory(p, category)).length;
  }, [allProducts, category]);

  const bannerImage =
    category.heroImage ||
    category.image_url ||
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80';

  return (
    <div className="w-full pb-20">
      {/* Category Hero Banner - Compact Height (Mobile ~200px, Desktop ~300px) */}
      <div className="relative h-[200px] md:h-[300px] w-full overflow-hidden bg-[#438DB8]">
        <img
          src={bannerImage}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-multiply scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Soft coastal gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#263B3F]/90 via-[#263B3F]/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-6 md:pb-8 text-white">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-white/80 mb-2" aria-label="Breadcrumb">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-[#FFB94B] transition-colors cursor-pointer"
            >
              首頁
            </button>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <span className="text-white font-medium">{category.name}</span>
            {selectedBrand !== 'all' && (
              <>
                <ChevronRight className="w-3 h-3 text-white/40" />
                <span className="text-[#FFB94B] font-medium">{selectedBrand}</span>
              </>
            )}
          </nav>

          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-[#FFB94B] font-semibold mb-1">
              {category.englishName || category.slug || 'AUSTRALIAN LIVING'}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white font-serif-brand">
              {category.name}
            </h1>
            <p className="mt-1.5 text-xs md:text-sm text-white/85 max-w-2xl leading-relaxed line-clamp-2">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Mobile / Tablet Filter & Sort Bar */}
        <div className="lg:hidden flex items-center justify-between gap-3 mb-6 p-3 bg-white rounded-xl border border-[#263B3F]/10 shadow-xs">
          {/* Scrollable brand pills (全部, Brand A, Brand B...) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 min-w-0 flex-grow">
            <button
              type="button"
              id="btn-mobile-filter-all"
              onClick={() => onSelectBrand('all')}
              className={`text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                selectedBrand === 'all'
                  ? 'bg-[#438DB8] text-white font-medium shadow-xs'
                  : 'bg-[#F6F3EA] text-[#263B3F]/80 border border-[#263B3F]/12 hover:border-[#438DB8]/40'
              }`}
            >
              <span>全部</span>
            </button>
            {dynamicBrands.map((b) => (
              <button
                key={b.name}
                type="button"
                id={`btn-mobile-brand-${b.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectBrand(b.name)}
                className={`text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  selectedBrand.toLowerCase() === b.name.toLowerCase()
                    ? 'bg-[#438DB8] text-white font-medium shadow-xs'
                    : 'bg-[#F6F3EA] text-[#263B3F]/80 border border-[#263B3F]/12 hover:border-[#438DB8]/40'
                }`}
              >
                <span>{b.name}</span>
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 shrink-0 border-l border-[#263B3F]/10 pl-3">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#263B3F]/60" />
            <select
              id="sort-select-mobile"
              aria-label="排序商品"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-transparent border-0 text-[#263B3F] font-medium focus:ring-0 cursor-pointer pr-1"
            >
              <option value="featured">推薦</option>
              <option value="price-asc">價低</option>
              <option value="price-desc">價高</option>
              <option value="newest">最新</option>
            </select>
          </div>
        </div>

        {/* Desktop 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Brand Filter Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white/70 backdrop-blur-xs p-5 rounded-2xl border border-[#263B3F]/10 shadow-[0_2px_16px_rgba(38,59,63,0.03)]">
              <BrandFilter
                brands={dynamicBrands}
                selectedBrand={selectedBrand}
                onSelectBrand={onSelectBrand}
              />
            </div>
          </div>

          {/* Right Column: Product Grid & Top Bar */}
          <div className="lg:col-span-3">
            {/* Desktop Sort Selector Bar */}
            <div className="hidden lg:flex items-center justify-end gap-2 text-xs text-[#263B3F]/80 mb-6">
              <span className="text-[#263B3F]/60">排序：</span>
              <select
                id="sort-select-desktop"
                aria-label="排序商品"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#263B3F]/15 rounded-lg px-3 py-1.5 text-xs text-[#263B3F] font-medium focus:ring-2 focus:ring-[#438DB8]/30 focus:border-[#438DB8] outline-hidden cursor-pointer"
              >
                <option value="featured">推薦排序</option>
                <option value="price-asc">價格：低至高</option>
                <option value="price-desc">價格：高至低</option>
                <option value="newest">新品優先</option>
              </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="py-16 px-4 text-center bg-white/60 rounded-2xl border border-dashed border-[#263B3F]/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#438DB8]/10 text-[#438DB8] flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-[#263B3F] mb-1">
                  目前在「{category.name}」找不到「{selectedBrand}」的商品
                </h3>
                <p className="text-xs text-[#263B3F]/60 max-w-md mx-auto mb-6 leading-relaxed">
                  該品牌可能僅於其他分類中有提供選物，或目前此分類無該品牌商品。
                </p>
                <button
                  type="button"
                  id="btn-empty-reset-brand"
                  onClick={() => onSelectBrand('all')}
                  className="px-5 py-2.5 bg-[#438DB8] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#438DB8]/90 transition-colors"
                >
                  查看「{category.name}」全部商品
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer / Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-[#263B3F]/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div
            id="mobile-filter-drawer"
            className="relative w-full max-w-xs bg-[#F6F3EA] h-full shadow-2xl p-6 flex flex-col z-10 animate-in slide-in-from-right duration-200"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#263B3F]/12 mb-4">
              <h3 className="text-base font-bold text-[#263B3F]">
                {category.name}
              </h3>
              <button
                type="button"
                id="btn-close-mobile-filter"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-white text-[#263B3F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-1">
              <BrandFilter
                brands={dynamicBrands}
                selectedBrand={selectedBrand}
                onSelectBrand={(brand) => {
                  onSelectBrand(brand);
                  setMobileFilterOpen(false);
                }}
                isMobileDrawer={true}
              />
            </div>

            <div className="pt-4 border-t border-[#263B3F]/12 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onSelectBrand('all');
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 px-3 rounded-lg border border-[#263B3F]/20 text-xs font-semibold text-[#263B3F] hover:bg-white"
              >
                重設全部
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-lg bg-[#438DB8] text-white text-xs font-semibold shadow-xs"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
