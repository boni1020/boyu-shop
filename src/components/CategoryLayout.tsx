import React, { useState, useMemo } from 'react';
import { Category, Product, CategoryId } from '../types';
import { BrandFilter } from './BrandFilter';
import { ProductCard } from './ProductCard';
import { getBrandsForCategory, filterProducts, matchesCategory } from '../utils/filterUtils';
import { ChevronRight, ArrowUpDown, ShoppingCart } from 'lucide-react';

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

      {/* Main Content Area: Left Sidebar (Brand + Sort) & Right Products */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex flex-row gap-3 sm:gap-6 lg:gap-8">
          {/* Left Column: Sticky Brand Filter + Sort Sidebar (Mobile, Tablet, Desktop) */}
          <div className="w-[110px] sm:w-44 md:w-52 lg:w-64 shrink-0">
            <div className="sticky top-[135px] sm:top-[160px] lg:top-[176px] bg-white/70 backdrop-blur-xs p-2.5 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border border-[#263B3F]/10 shadow-[0_2px_16px_rgba(38,59,63,0.03)]">
              <BrandFilter
                brands={dynamicBrands}
                selectedBrand={selectedBrand}
                onSelectBrand={onSelectBrand}
              />

              {/* Sort Control in the Left Sidebar */}
              <div className="pt-2.5 sm:pt-4 mt-2.5 sm:mt-4 border-t border-[#263B3F]/12">
                <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#2B8D9C]" />
                  <span className="text-xs sm:text-sm font-semibold text-[#263B3F] tracking-wide">
                    排序
                  </span>
                </div>
                <select
                  id="sort-select"
                  aria-label="排序商品"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-white border border-[#263B3F]/15 rounded-lg px-1.5 sm:px-2.5 py-1.5 text-[11px] sm:text-xs text-[#263B3F] font-medium focus:ring-2 focus:ring-[#438DB8]/30 focus:border-[#438DB8] outline-hidden cursor-pointer"
                >
                  <option value="featured">推薦排序</option>
                  <option value="price-asc">價格：低至高</option>
                  <option value="price-desc">價格：高至低</option>
                  <option value="newest">新品優先</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Product Grid */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-[#263B3F] mb-6">
                  目前沒有「{category.name}」的商品
                </h3>
                <button
                  type="button"
                  id="btn-empty-navigate-home"
                  onClick={onNavigateHome}
                  className="px-5 py-2.5 bg-[#438DB8] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#438DB8]/90 transition-colors cursor-pointer"
                >
                  回首頁
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
