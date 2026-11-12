import React, { useState, useRef, useEffect } from 'react';
import { CategoryId, Product } from '../types';
import { useCart } from '../context/CartContext';
import { useCategories } from '../context/CategoryContext';
import { useProducts } from '../context/ProductContext';
import {
  Search,
  X,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Check,
  Home,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'category' | 'search' | 'cart';
  activeCategoryId?: CategoryId;
  onNavigateHome: () => void;
  onNavigateCart: () => void;
  onSelectCategory: (categoryId: CategoryId) => void;
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  activeCategoryId,
  onNavigateHome,
  onNavigateCart,
  onSelectCategory,
  onSearch,
}) => {
  const { cartItemCount, toast, dismissToast } = useCart();
  const { categories, isLoading } = useCategories();
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Quick Autocomplete items derived from real Supabase products
  const quickSuggestions: Product[] = React.useMemo(() => {
    if (!searchQuery.trim() || !products.length) return [];
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 4);
  }, [searchQuery, products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  // Close search suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#F6F3EA]/95 backdrop-blur-md border-b border-[#263B3F]/10 shadow-[0_1px_10px_rgba(38,59,63,0.03)]">
        {/* 全站運費公告列 */}
        <div
          id="site-shipping-announcement-bar"
          className="w-full bg-[#263B3F] text-[#F6F3EA] py-1.5 px-3 sm:px-4 border-b border-black/10 select-none text-center"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <p className="text-[11px] sm:text-xs font-medium tracking-wide leading-normal">
              未滿一公斤，運費200，一公斤以上免運。
            </p>
          </div>
        </div>

        {/* Main Desktop Header Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative hidden lg:flex items-center justify-between h-16 w-full">
            {/* 1. 回首頁 Icon / Logo (固定在最左側) */}
            <div className="flex items-center shrink-0 z-10">
              <button
                type="button"
                id="nav-home-icon-btn"
                onClick={onNavigateHome}
                className={`p-2.5 rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center shrink-0 ${
                  currentView === 'home'
                    ? 'bg-[#438DB8] text-white shadow-xs font-semibold'
                    : 'text-[#263B3F]/80 hover:text-[#263B3F] hover:bg-[#263B3F]/6'
                }`}
                title="首頁"
                aria-label="首頁"
              >
                <Home className="w-5 h-5" />
              </button>
            </div>

            {/* 2. 商品分類 (相對於整個 Navbar / Viewport 真正水平置中，不受左右側寬度影響) */}
            <nav
              id="desktop-category-nav"
              aria-label="商品分類"
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center space-x-1 xl:space-x-2 pointer-events-auto z-0"
            >
              {isLoading && categories.length === 0 ? (
                <div className="flex items-center gap-2 py-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className="h-7 w-16 xl:w-20 bg-[#263B3F]/8 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                categories.map((cat) => {
                  const isActive =
                    currentView === 'category' &&
                    (activeCategoryId === cat.id ||
                      activeCategoryId === cat.slug ||
                      activeCategoryId === cat.name);

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      id={`nav-category-${cat.slug || cat.id}`}
                      onClick={() => onSelectCategory(cat.id)}
                      className={`px-2.5 xl:px-3.5 py-1.5 text-xs xl:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#438DB8] text-white shadow-xs font-semibold'
                          : 'text-[#263B3F]/80 hover:text-[#263B3F] hover:bg-[#263B3F]/6'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })
              )}
            </nav>

            {/* 3. 搜尋與購物車 (固定在最右側) */}
            <div className="flex items-center gap-2.5 xl:gap-3 shrink-0 z-10 ml-auto">
              {/* 搜尋 (Search) */}
              <div
                ref={searchContainerRef}
                className="relative w-40 lg:w-44 xl:w-60 focus-within:w-52 xl:focus-within:w-64 transition-all duration-200 shrink-0"
              >
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    id="header-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="搜尋商品、品牌..."
                    className="w-full pl-8 xl:pl-9 pr-7 xl:pr-8 py-2 rounded-full bg-white border border-[#263B3F]/15 text-xs text-[#263B3F] placeholder:text-[#263B3F]/45 focus:outline-hidden focus:border-[#438DB8] focus:ring-2 focus:ring-[#438DB8]/20 transition-all"
                  />
                  <Search className="w-4 h-4 text-[#263B3F]/40 absolute left-2.5 xl:left-3 top-2.5 pointer-events-none" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 xl:right-2.5 top-2.5 text-[#263B3F]/40 hover:text-[#263B3F] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>

                {/* Quick Autocomplete Suggestions Dropdown */}
                {searchFocused && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full right-0 w-72 bg-white rounded-xl shadow-xl border border-[#263B3F]/12 overflow-hidden z-50 animate-in fade-in-50 duration-150">
                    <div className="p-2.5 bg-[#F6F3EA]/70 border-b border-[#263B3F]/8 text-[11px] font-semibold text-[#263B3F]/70 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-[#438DB8]" />
                        即時搜尋建議
                      </span>
                      <span className="text-[10px] text-[#263B3F]/50">Enter 送出</span>
                    </div>

                    {quickSuggestions.length > 0 ? (
                      <div className="divide-y divide-[#263B3F]/6 max-h-64 overflow-y-auto">
                        {quickSuggestions.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              onSearch(prod.name);
                              setSearchQuery('');
                              setSearchFocused(false);
                            }}
                            className="p-2.5 hover:bg-[#F6F3EA] cursor-pointer flex items-center gap-2.5 transition-colors"
                          >
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-8 h-8 object-contain rounded bg-white shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-grow min-w-0">
                              <div className="text-xs font-semibold text-[#263B3F] truncate">
                                {prod.name}
                              </div>
                              <div className="text-[11px] text-[#438DB8]">
                                {prod.brand} ∙ NT$ {prod.price.toLocaleString()}
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-[#263B3F]/30 shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div
                      onClick={() => {
                        onSearch(searchQuery);
                        setSearchQuery('');
                        setSearchFocused(false);
                      }}
                      className="p-2.5 bg-[#438DB8] text-white text-xs font-medium text-center hover:bg-[#438DB8]/90 cursor-pointer transition-colors"
                    >
                      搜尋全部與「{searchQuery}」相關商品 →
                    </div>
                  </div>
                )}
              </div>

              {/* 購物車 (Cart) */}
              <div className="shrink-0">
                <button
                  type="button"
                  id="btn-header-cart"
                  onClick={onNavigateCart}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'cart'
                      ? 'bg-[#438DB8] text-white shadow-xs'
                      : 'bg-white border border-[#263B3F]/15 text-[#263B3F] hover:border-[#438DB8] hover:text-[#438DB8]'
                  }`}
                  aria-label="購物車"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>購物車</span>
                  {cartItemCount > 0 ? (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold min-w-[1.25rem] text-center ${
                        currentView === 'cart'
                          ? 'bg-white text-[#438DB8]'
                          : 'bg-[#438DB8] text-white'
                      }`}
                    >
                      {cartItemCount}
                    </span>
                  ) : (
                    <span className="text-[#263B3F]/50">0</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile & Tablet Header (Row 1: Home + Search + Cart) */}
          <div className="flex lg:hidden items-center justify-between gap-2.5 h-14">
            {/* Mobile Home Button */}
            <button
              type="button"
              id="btn-mobile-header-home"
              onClick={onNavigateHome}
              className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                currentView === 'home'
                  ? 'bg-[#438DB8] text-white shadow-xs'
                  : 'text-[#263B3F] hover:bg-[#263B3F]/8'
              }`}
              title="首頁"
              aria-label="首頁"
            >
              <Home className="w-5 h-5" />
            </button>

            {/* Mobile Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋商品、品牌..."
                className="w-full pl-8 pr-7 py-1.5 rounded-full bg-white border border-[#263B3F]/15 text-xs text-[#263B3F] placeholder:text-[#263B3F]/45 focus:outline-hidden focus:border-[#438DB8]"
              />
              <Search className="w-3.5 h-3.5 text-[#263B3F]/40 absolute left-2.5 top-2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-[#263B3F]/40 hover:text-[#263B3F]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>

            {/* Mobile Cart Button */}
            <button
              type="button"
              id="btn-mobile-header-cart"
              onClick={onNavigateCart}
              className={`relative flex items-center justify-center p-2 rounded-full shrink-0 transition-all cursor-pointer ${
                currentView === 'cart'
                  ? 'bg-[#438DB8] text-white'
                  : 'bg-white border border-[#263B3F]/15 text-[#263B3F]'
              }`}
              aria-label="購物車"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center rounded-full text-[10px] font-bold bg-[#438DB8] text-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Category Scroll Row (Row 2: horizontal scroll on mobile, centered on tablet) */}
        <div className="lg:hidden border-t border-[#263B3F]/8 bg-[#F6F3EA]/90 nav-horizontal-scrollbar px-3 sm:px-6 pt-1.5 pb-2 flex items-center justify-start md:justify-center gap-1.5 md:gap-3 flex-nowrap">
          {categories.map((cat) => {
            const isActive =
              currentView === 'category' &&
              (activeCategoryId === cat.id ||
                activeCategoryId === cat.slug ||
                activeCategoryId === cat.name);
            return (
              <button
                key={cat.id}
                type="button"
                id={`mobile-nav-category-${cat.slug || cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#438DB8] text-white font-semibold shadow-xs'
                    : 'text-[#263B3F]/80 hover:text-[#263B3F] hover:bg-[#263B3F]/6'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </header>

      {/* Floating Add to Cart Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#263B3F] text-white rounded-2xl p-4 shadow-2xl border border-white/10 flex items-center gap-4 max-w-sm">
            <img
              src={toast.imageUrl}
              alt={toast.productName}
              className="w-12 h-12 rounded-lg object-contain bg-white shrink-0 p-1"
              referrerPolicy="no-referrer"
            />
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-1 text-[11px] text-[#FFB94B] font-semibold">
                <Check className="w-3.5 h-3.5" />
                已加入購物車 (+{toast.quantity})
              </div>
              <div className="text-xs font-medium text-white truncate mt-0.5">
                {toast.productName}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                dismissToast();
                onNavigateCart();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#438DB8] hover:bg-[#438DB8]/90 text-white text-xs font-semibold shrink-0 cursor-pointer"
            >
              檢視
            </button>
            <button
              type="button"
              onClick={dismissToast}
              className="p-1 text-white/50 hover:text-white cursor-pointer"
              aria-label="關閉通知"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
