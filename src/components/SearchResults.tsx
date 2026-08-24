import React, { useState, useMemo } from 'react';
import { Product, CategoryId } from '../types';
import { ProductCard } from './ProductCard';
import { useCategories } from '../context/CategoryContext';
import { Search, ChevronRight } from 'lucide-react';

interface SearchResultsProps {
  searchQuery: string;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateHome: () => void;
  onSelectCategory: (categoryId: CategoryId) => void;
  onSearchChange: (newQuery: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchQuery,
  allProducts,
  onSelectProduct,
  onNavigateHome,
  onSelectCategory,
  onSearchChange,
}) => {
  const { categories } = useCategories();
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Global search matches across name, brand, tags, description, origin
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return allProducts.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchCategory = p.categoryName.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchShortDesc = p.shortDescription.toLowerCase().includes(q);
      const matchTags = p.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchOrigin = p.origin.toLowerCase().includes(q);
      const matchFeatures = p.features?.some((f) => f.toLowerCase().includes(q));
      return (
        matchName ||
        matchBrand ||
        matchCategory ||
        matchDesc ||
        matchShortDesc ||
        matchTags ||
        matchOrigin ||
        matchFeatures
      );
    });
  }, [allProducts, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchChange(searchInput.trim());
      setSearchInput('');
    }
  };

  return (
    <div className="w-full pb-20">
      {/* Search Header Banner */}
      <div className="bg-[#438DB8] text-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-white/80 mb-3" aria-label="Breadcrumb">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-[#FFB94B] transition-colors cursor-pointer"
            >
              首頁
            </button>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <span className="text-white font-medium">全站搜尋</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-[#FFB94B] font-semibold mb-1">
                SEARCH DISCOVERY
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                搜尋關鍵字：
                <span className="text-[#FFB94B] font-serif-brand underline decoration-[#FFB94B]/40 underline-offset-4">
                  「{searchQuery}」
                </span>
              </h1>
              <p className="mt-1.5 text-xs md:text-sm text-white/85">
                共找到 <span className="font-semibold text-white">{searchResults.length}</span> 件符合的澳洲海岸選物
              </p>
            </div>

            {/* Quick Search Re-input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <input
                type="text"
                id="search-page-input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜尋商品、品牌或關鍵字..."
                className="w-full pl-9 pr-12 py-2.5 rounded-full bg-white/15 border border-white/30 text-white placeholder:text-white/60 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#FFB94B] focus:bg-white/20 transition-all"
              />
              <Search className="w-4 h-4 text-white/70 absolute left-3 top-3 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-white text-[#438DB8] text-xs font-semibold rounded-full hover:bg-[#F6F3EA] transition-colors cursor-pointer"
              >
                搜尋
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Results Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {searchResults.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-20 px-4 text-center bg-white/70 rounded-2xl border border-dashed border-[#263B3F]/20 max-w-2xl mx-auto">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#FFB94B]/15 text-[#263B3F] flex items-center justify-center">
              <Search className="w-7 h-7 text-[#438DB8]" />
            </div>
            <h3 className="text-lg font-bold text-[#263B3F] mb-2 font-serif-brand">
              找不到與「{searchQuery}」相關的商品
            </h3>
            <p className="text-xs md:text-sm text-[#263B3F]/70 mb-6 leading-relaxed">
              請嘗試使用其他關鍵字（如：精油、Healthy Care、面膜、綿羊油、魚油、葉黃素），或直接瀏覽下方推薦的分類選物。
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              <span className="text-xs text-[#263B3F]/60">熱門搜尋推薦：</span>
              {['Swisse', '尤加利', 'Blackmores', 'Eaoron', '膠原蛋白', '魚油'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchInput(term);
                    onSearchChange(term);
                  }}
                  className="text-xs px-3 py-1 rounded-full bg-white border border-[#263B3F]/15 text-[#263B3F] hover:border-[#438DB8] hover:text-[#438DB8] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-[#263B3F]/10 flex flex-wrap justify-center gap-2">
              {categories.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCategory(c.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#438DB8]/10 text-[#438DB8] font-medium hover:bg-[#438DB8] hover:text-white transition-colors"
                >
                  探索 {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

