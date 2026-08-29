import React, { useState, useRef, useEffect } from 'react';
import { CategoryId, Product } from '../types';
import { useCart } from '../context/CartContext';
import { useCategories } from '../context/CategoryContext';
import { useProducts } from '../context/ProductContext';
import {
  Search,
  X,
  Menu,
  Sparkles,
  ShoppingBag,
  Tag,
  ArrowRight,
  TrendingUp,
  Check,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'category' | 'search' | 'cart' | 'checkout' | 'order-success';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Mobile search expandable

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
      setIsSearchOpen(false);
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
      <header className="sticky top-0 z-40 w-full bg-[#F6F3EA]/95 backdrop-blur-md border-b border-[#263B3F]/10 shadow-[0_1px_12px_rgba(38,59,63,0.03)]">
        {/* Top Announcement Bar - Primary #438DB8 */}
        <div className="bg-[#438DB8] text-white text-[11px] py-1.5 px-4 text-center tracking-wider font-light flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 text-white">
            <Sparkles className="w-3 h-3 text-[#FFB94B]" />
            單筆消費滿 NT$ 2,000 即享全台免運 ｜ 把澳洲好物帶進你的可愛日常
          </span>
        </div>

        {/* Main Header Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 md:h-20">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                id="btn-mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-lg text-[#263B3F] hover:bg-[#263B3F]/8 focus:outline-hidden"
                aria-label="選單"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                id="brand-logo-btn"
                onClick={onNavigateHome}
                className="group flex flex-col items-start text-left focus:outline-hidden cursor-pointer"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#263B3F] font-serif-brand group-hover:text-[#438DB8] transition-colors">
                    波波澳洲代購
                  </span>
                  <span className="text-xs font-semibold tracking-[0.2em] text-[#438DB8]">
                    BoBo AU
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Search Bar in Header */}
            <div
              ref={searchContainerRef}
              className="hidden md:block relative w-72 lg:w-96"
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  id="header-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="搜尋想找的澳洲好物、品牌（如 魚油、膠原蛋白）..."
                  className="w-full pl-9 pr-10 py-2 rounded-full bg-white border border-[#263B3F]/15 text-xs text-[#263B3F] placeholder:text-[#263B3F]/45 focus:outline-hidden focus:border-[#438DB8] focus:ring-2 focus:ring-[#438DB8]/20 transition-all"
                />
                <Search className="w-4 h-4 text-[#263B3F]/40 absolute left-3 top-2.5 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-[#263B3F]/40 hover:text-[#263B3F]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Quick Autocomplete Suggestions Dropdown */}
              {searchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#263B3F]/12 overflow-hidden z-50 animate-in fade-in-50 duration-150">
                  <div className="p-2.5 bg-[#F6F3EA]/70 border-b border-[#263B3F]/8 text-[11px] font-semibold text-[#263B3F]/70 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-[#438DB8]" />
                      相關即時選物
                    </span>
                    <span className="text-[10px] text-[#263B3F]/50">按 Enter 送出全站搜尋</span>
                  </div>

                  {/* quickSuggestions */}
                  {/* {quickSuggestions.length > 0 ? (
                    <div className="divide-y divide-[#263B3F]/6">
                      {quickSuggestions.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            onSearch(prod.name);
                            setSearchFocused(false);
                          }}
                          className="p-3 hover:bg-[#F6F3EA] cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-md bg-[#F6F3EA]"
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
                          <ArrowRight className="w-3.5 h-3.5 text-[#263B3F]/30" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-[#263B3F]/60">
                      無即時推薦，按 Enter 送出進行模糊搜尋
                    </div>
                  )} */}

                  <div
                    onClick={() => {
                      onSearch(searchQuery);
                      setSearchQuery('');
                      setSearchFocused(false);
                    }}
                    className="p-2.5 bg-[#438DB8] text-white text-xs font-medium text-center hover:bg-[#438DB8]/90 cursor-pointer transition-colors"
                  >
                    搜尋全部與「{searchQuery}」相關的結果 →
                  </div>
                </div>
              )}
            </div>

            {/* Right Action Icons & Shopping Cart */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Trigger Icon */}
              <button
                type="button"
                id="btn-mobile-search-toggle"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2 text-[#263B3F] hover:bg-[#263B3F]/8 rounded-lg focus:outline-hidden cursor-pointer"
                aria-label="搜尋"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Shopping Cart Button */}
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
                <span className="hidden sm:inline">購物車</span>
                {cartItemCount > 0 ? (
                  <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold min-w-[1.25rem] text-center ${
                    currentView === 'cart' ? 'bg-white text-[#438DB8]' : 'bg-[#438DB8] text-white'
                  }`}>
                    {cartItemCount}
                  </span>
                ) : (
                  <span className="hidden sm:inline text-[#263B3F]/50">0</span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Collapsible */}
          {isSearchOpen && (
            <div className="md:hidden pb-3 px-1">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜尋商品、品牌或關鍵字..."
                  className="w-full pl-9 pr-16 py-2.5 rounded-xl bg-white border border-[#263B3F]/20 text-xs text-[#263B3F] focus:outline-hidden focus:border-[#438DB8]"
                  autoFocus
                />
                <Search className="w-4 h-4 text-[#263B3F]/50 absolute left-3 top-3" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 px-3 py-1 bg-[#438DB8] text-white text-xs font-semibold rounded-lg"
                >
                  搜尋
                </button>
              </form>
            </div>
          )}

          {/* Desktop Category Navigation Tabs (The Supabase Categories - Centered) */}
          <nav className="hidden lg:flex items-center justify-center border-t border-[#263B3F]/8 py-2.5 overflow-x-auto scrollbar-none">
            <div className="flex items-center justify-center space-x-1 xl:space-x-2">
              {isLoading && categories.length === 0 ? (
                <div className="flex items-center gap-2 py-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className="h-7 w-20 bg-[#263B3F]/8 rounded-lg animate-pulse"
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
                  const isClearance =
                    cat.slug === 'sale' ||
                    cat.slug === 'clearance' ||
                    cat.name.includes('清倉');
                  const isNewArrival =
                    cat.slug === 'new' ||
                    cat.slug === 'new-arrivals' ||
                    cat.name.includes('新品');

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      id={`nav-category-${cat.slug || cat.id}`}
                      onClick={() => onSelectCategory(cat.id)}
                      className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#438DB8] text-white shadow-xs font-semibold'
                          : isClearance
                          ? 'text-[#263B3F] bg-[#FFB94B]/20 hover:bg-[#FFB94B]/35 border border-[#FFB94B]/40 font-semibold'
                          : 'text-[#263B3F]/80 hover:text-[#263B3F] hover:bg-[#263B3F]/6'
                      }`}
                    >
                      {isClearance && <Tag className="w-3.5 h-3.5 text-[#FFB94B]" />}
                      {isNewArrival && (
                        <Sparkles
                          className={`w-3 h-3 ${isActive ? 'text-white' : 'text-[#438DB8]'}`}
                        />
                      )}
                      <span>{cat.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Floating Add to Cart Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#263B3F] text-white rounded-2xl p-4 shadow-2xl border border-white/10 flex items-center gap-4 max-w-sm">
            <img
              src={toast.imageUrl}
              alt={toast.productName}
              className="w-12 h-12 rounded-lg object-cover bg-white shrink-0"
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

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu Content */}
          <div className="relative w-[85%] max-w-sm bg-[#F6F3EA] h-full shadow-2xl p-6 flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#263B3F]/12 mb-6">
              <div>
                <span className="text-xl font-bold text-[#263B3F] font-serif-brand">
                  波波澳洲代購
                </span>
                <span className="block text-[10px] text-[#438DB8] uppercase tracking-widest font-medium">
                  BoBo Australia
                </span>
              </div>
              <button
                type="button"
                id="btn-close-mobile-menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-white text-[#263B3F] transition-colors focus:outline-hidden cursor-pointer"
                aria-label="關閉選單"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Cart Quick Link */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  onNavigateCart();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 px-4 rounded-xl bg-white border border-[#263B3F]/15 flex items-center justify-between text-[#263B3F] font-semibold text-sm cursor-pointer shadow-xs hover:border-[#438DB8]"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#438DB8]" />
                  <span>我的購物車</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#438DB8] text-white text-xs">
                  {cartItemCount}
                </span>
              </button>
            </div>

            {/* Drawer Links */}
            <div className="flex flex-col gap-2 flex-grow overflow-y-auto pr-1">
              <div className="text-xs font-semibold text-[#263B3F]/50 uppercase tracking-wider mb-1 px-3">
                選物分類
              </div>

              {categories.map((cat) => {
                const isActive =
                  currentView === 'category' &&
                  (activeCategoryId === cat.id ||
                    activeCategoryId === cat.slug ||
                    activeCategoryId === cat.name);
                const isClearance =
                  cat.slug === 'sale' ||
                  cat.slug === 'clearance' ||
                  cat.name.includes('清倉');
                const isNewArrival =
                  cat.slug === 'new' ||
                  cat.slug === 'new-arrivals' ||
                  cat.name.includes('新品');

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#438DB8] text-white shadow-xs font-semibold'
                        : isClearance
                        ? 'bg-[#FFB94B]/20 text-[#263B3F] border border-[#FFB94B]/40'
                        : 'text-[#263B3F] hover:bg-[#263B3F]/6'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isClearance && <Tag className="w-4 h-4 text-[#FFB94B]" />}
                      {isNewArrival && (
                        <Sparkles
                          className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#438DB8]'}`}
                        />
                      )}
                      <span className="text-[15px]">{cat.name}</span>
                    </div>
                    <span
                      className={`text-xs ${
                        isActive ? 'text-white/80' : 'text-[#263B3F]/40'
                      }`}
                    >
                      {cat.englishName}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-[#263B3F]/12 text-center">
              <button
                type="button"
                onClick={() => {
                  onNavigateHome();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-medium text-[#438DB8] hover:underline cursor-pointer"
              >
                返回代購首頁 →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
