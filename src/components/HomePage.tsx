import React from 'react';
import { CategoryId, Product } from '../types';
import { ProductCard } from './ProductCard';
import { ArrowRight, Sparkles, Tag, ShoppingBag, Utensils, AlertCircle, Heart, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCategories } from '../context/CategoryContext';
import { useProducts } from '../context/ProductContext';
import { getProductEffectivePrice, getProductOriginalPrice } from '../utils/priceUtils';

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
  const { addToCart } = useCart();
  const {
    categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
    isProductInCategory,
  } = useCategories();
  const {
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts();

  // Development debug check
  React.useEffect(() => {
    console.log('[Homepage] products source = Supabase, count =', allProducts.length);
    console.log('[Homepage] categories source = Supabase, count =', categories.length);
  }, [allProducts, categories]);

  // 1. New Arrival Products (Strict isNewArrival === true, no fake fallback)
  const newArrivals = React.useMemo(() => {
    return allProducts.filter((p) => p.isNewArrival === true).slice(0, 5);
  }, [allProducts]);

  // 2. Curated Categories (All active EXCEPT clearance, sorted by sort_order from Supabase)
  const curatedCategories = React.useMemo(() => {
    return categories.filter(
      (c) =>
        c.slug !== 'clearance' &&
        c.slug !== 'sale' &&
        !c.name.includes('清倉') &&
        !c.name.includes('出清')
    );
  }, [categories]);

  // Top 3 categories for Section 3
  const top3Categories = React.useMemo(() => {
    return curatedCategories.slice(0, 3);
  }, [curatedCategories]);

  // Remaining 2 categories for Section 5
  const remainingCategories = React.useMemo(() => {
    return curatedCategories.slice(3, 5);
  }, [curatedCategories]);

  // 3. Clearance Products for Section 6 (Strict isClearance === true, no fake fallback)
  const clearanceProducts = React.useMemo(() => {
    return allProducts.filter((p) => p.isClearance === true).slice(0, 2);
  }, [allProducts]);

  // Target ID for explore / life category
  const exploreCategoryId = React.useMemo(() => {
    const lifeCat = categories.find(
      (c) => c.name === '生活補給' || c.slug === 'life-supplies' || c.slug === 'life' || c.slug === 'healthy'
    );
    return lifeCat ? lifeCat.id : 'life-supplies';
  }, [categories]);

  // Target ID for food pantry
  const foodCategoryId = React.useMemo(() => {
    const foodCat = categories.find(
      (c) => c.name === '食光選物' || c.slug === 'food' || c.slug === 'food-pantry'
    );
    return foodCat ? foodCat.id : 'food';
  }, [categories]);

  // Target ID for clearance category
  const clearanceCatId = React.useMemo(() => {
    const clearanceCat = categories.find(
      (c) => c.type === 'sale' || c.name.includes('特價') || c.name.includes('清倉') || c.slug === 'clearance' || c.slug === 'sale'
    );
    return clearanceCat ? clearanceCat.id : 'sale';
  }, [categories]);

  // Target ID & products for Section 7: Beauty & Skincare
  const beautyCategory = React.useMemo(() => {
    return categories.find(
      (c) =>
        c.name.includes('美妍') ||
        c.name.includes('美妝') ||
        c.name.includes('保養') ||
        c.slug === 'beauty' ||
        c.slug === 'skincare'
    );
  }, [categories]);

  const beautyCategoryId = React.useMemo(() => {
    return beautyCategory ? beautyCategory.id : 'beauty';
  }, [beautyCategory]);

  const beautyProducts = React.useMemo(() => {
    if (!beautyCategory) return [];
    return allProducts.filter((p) => isProductInCategory(p, beautyCategory)).slice(0, 5);
  }, [allProducts, beautyCategory, isProductInCategory]);

  const activeError = productsError || categoriesError;

  return (
    <div className="w-full pb-0 overflow-x-hidden">
      {/* Global Supabase Error Alert if connection fails */}
      {activeError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-red-800 text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>資料讀取發生異常：{activeError}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                refetchCategories();
                refetchProducts();
              }}
              className="text-xs text-red-700 underline font-medium hover:text-red-900"
            >
              重新整理資料
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          1. HERO SECTION: Life / Living Hero
      ======================================================== */}
      <section className="relative min-h-[460px] md:min-h-[520px] w-full bg-[#438DB8] overflow-hidden flex items-center">
        {/* Background Image with ocean sunlight */}
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
          alt="Australian Coastal Living"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-multiply scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Atmospheric gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#263B3F]/90 via-[#263B3F]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#263B3F]/80 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-white w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-[#FFB94B] bg-white/10 backdrop-blur-xs border border-white/20 tracking-[0.2em] uppercase mb-4 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              AUSTRALIAN DIRECT SELECTION
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white font-serif-brand leading-[1.15] mb-6">
              把澳洲的陽光與日常，打包寄給你
            </h1>

            <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-xl mb-8 font-light">
              波波嚴選南半球純淨好物，保健補給、有機美食與日常保養，輕鬆直送你家！
            </p>

            <div className="flex items-center gap-4">
              <button
                type="button"
                id="btn-hero-explore-life"
                onClick={() => onSelectCategory(exploreCategoryId)}
                className="px-7 py-3.5 rounded-full bg-[#438DB8] text-white text-xs md:text-sm font-semibold shadow-lg hover:bg-[#438DB8]/90 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>逛逛生活補給專區</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. NEW ARRIVALS (新品上市): 5 items
          - Desktop: 5 columns grid
          - Mobile / Tablet: Horizontal swipe carousel / slideshow (5 items)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3 md:pt-12 md:pb-6 lg:py-18">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="w-full sm:w-auto">
            {/* Row 1: [Icon] NEW ARRIVALS */}
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#438DB8] tracking-widest uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB94B]" />
              NEW ARRIVALS
            </div>

            {/* Row 2: Mobile (新品上市 on left, 看更多最新好物 on right) | Desktop (新品上市) */}
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#263B3F] font-serif-brand">
                新品上市
              </h2>
              {/* Mobile Right Link */}
              <button
                type="button"
                id="btn-home-view-all-new-arrivals-mobile"
                onClick={() => {
                  const newCat = categories.find(
                    (c) => c.name.includes('新品') || c.slug === 'new-arrivals' || c.slug === 'new'
                  );
                  onSelectCategory(newCat ? newCat.id : 'new-arrivals');
                }}
                className="sm:hidden text-xs font-semibold text-[#438DB8] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>看更多最新好物</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Row 3: Subtitle */}
            <p className="text-xs sm:text-sm text-[#263B3F]/70 mt-1">
              剛從澳洲搭飛機來台的最新好物！
            </p>
          </div>

          {/* Desktop Right Link */}
          <div className="hidden sm:flex items-center justify-end gap-3 self-auto">
            <button
              type="button"
              id="btn-home-view-all-new-arrivals"
              onClick={() => {
                const newCat = categories.find(
                  (c) => c.name.includes('新品') || c.slug === 'new-arrivals' || c.slug === 'new'
                );
                onSelectCategory(newCat ? newCat.id : 'new-arrivals');
              }}
              className="text-xs font-semibold text-[#438DB8] hover:underline flex items-center gap-1 self-auto cursor-pointer"
            >
              <span>看更多最新好物</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isProductsLoading && allProducts.length === 0 ? (
          <div className="flex items-stretch overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3.5 sm:gap-4 pb-4 pt-1 px-4 sm:px-6 -mx-4 sm:-mx-6 lg:grid lg:grid-cols-5 lg:gap-4 sm:lg:gap-5 lg:p-0 lg:m-0 lg:overflow-visible">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-[66vw] min-w-[210px] max-w-[260px] sm:w-[230px] shrink-0 snap-start self-stretch bg-white rounded-xl p-3 border border-[#263B3F]/10 animate-pulse lg:w-auto lg:min-w-0 lg:max-w-none lg:shrink lg:snap-align-none"
              >
                <div className="aspect-square bg-[#263B3F]/10 rounded-lg mb-3" />
                <div className="h-3 bg-[#263B3F]/10 rounded-sm w-2/3 mb-2" />
                <div className="h-4 bg-[#263B3F]/15 rounded-sm w-full mb-3" />
                <div className="h-4 bg-[#263B3F]/20 rounded-sm w-1/2" />
              </div>
            ))}
          </div>
        ) : newArrivals.length === 0 ? (
          <div className="py-12 text-center bg-white/60 border border-[#263B3F]/10 rounded-xl">
            <p className="text-[#263B3F]/70 text-sm">目前尚無新上架的好物</p>
          </div>
        ) : (
          /* Products: Desktop 5 columns grid | Mobile Horizontal Swipe Carousel */
          <div
            className="flex items-stretch overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3.5 sm:gap-4 pb-4 pt-1 px-4 sm:px-6 -mx-4 sm:-mx-6 scroll-smooth lg:grid lg:grid-cols-5 lg:gap-4 sm:lg:gap-5 lg:p-0 lg:m-0 lg:overflow-visible"
          >
            {newArrivals.map((product) => (
              <div
                key={product.id}
                className="w-[66vw] min-w-[210px] max-w-[260px] sm:w-[230px] shrink-0 snap-start flex flex-col self-stretch lg:w-auto lg:min-w-0 lg:max-w-none lg:shrink lg:snap-align-none"
              >
                <ProductCard
                  product={product}
                  onSelect={onSelectProduct}
                />
              </div>
            ))}
            {/* Mobile end spacer for clean right margin scroll */}
            <div className="w-4 shrink-0 lg:hidden" aria-hidden="true" />
          </div>
        )}
      </section>

      {/* ========================================================
          3. CURATED CATEGORIES (Top 3): 3 columns
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-12 md:pt-6 md:pb-14 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-[#438DB8] font-semibold block mb-1">
            CURATED CATEGORIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263B3F] font-serif-brand">
            精選澳洲主題專區
          </h2>
          <p className="text-xs md:text-sm text-[#263B3F]/70 mt-1">
            分類逛逛最想入手的澳洲好物
          </p>
        </div>

        {/* Loading State Skeleton */}
        {isCategoriesLoading && top3Categories.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-white border border-[#263B3F]/10 rounded-none overflow-hidden animate-pulse flex flex-col"
              >
                <div className="w-full h-56 sm:h-64 bg-[#263B3F]/8" />
                <div className="p-6 space-y-3">
                  <div className="h-5 w-2/3 bg-[#263B3F]/12 rounded-sm" />
                  <div className="h-4 w-full bg-[#263B3F]/8 rounded-sm" />
                  <div className="h-4 w-4/5 bg-[#263B3F]/8 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Top 3 Category Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {top3Categories.map((cat) => {
              const productCount = allProducts.filter((p) =>
                isProductInCategory(p, cat)
              ).length;

              return (
                <div
                  key={cat.id}
                  id={`category-card-${cat.slug || cat.id}`}
                  onClick={() => onSelectCategory(cat.id)}
                  className="group relative rounded-none overflow-hidden cursor-pointer bg-white border border-[#263B3F]/12 shadow-[0_2px_12px_rgba(38,59,63,0.04)] hover:shadow-[0_8px_28px_rgba(38,59,63,0.1)] transition-all duration-300 flex flex-col"
                >
                  {/* Category Image */}
                  <div className="relative w-full h-56 sm:h-64 overflow-hidden rounded-none bg-[#F6F3EA]">
                    <img
                      src={cat.heroImage || cat.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80'}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 rounded-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#263B3F]/85 via-[#263B3F]/25 to-transparent rounded-none" />

                    {/* Top Tag */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-white bg-[#438DB8] shadow-xs rounded-none">
                        {cat.englishName || cat.slug || 'AUSTRALIAN LIVING'}
                      </span>
                    </div>

                    {/* Item count badge */}
                    <div className="absolute bottom-3 right-4 text-[11px] text-white/90 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-none">
                      {productCount} 件選物
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-grow justify-between bg-white rounded-none">
                    <div>
                      <h3 className="text-xl font-bold text-[#263B3F] group-hover:text-[#438DB8] transition-colors font-serif-brand mb-2">
                        {cat.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#263B3F]/75 leading-relaxed line-clamp-2">
                        {cat.description || '來自澳洲海岸與陽光森林的純淨生活選物。'}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#263B3F]/10 flex items-center justify-between text-xs font-semibold text-[#438DB8]">
                      <span>進入分類瀏覽</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================
          4. FOOD PANTRY (食光選物 Banner): Australian Pantry & Gourmet (No carousel)
      ======================================================== */}
      <section className="w-full relative bg-[#263B3F] text-white overflow-hidden py-16 md:py-24 my-0">
        {/* Full-width High-Quality Lifestyle Background Image */}
        <img
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=2200&q=80"
          alt="食光選物 Australian Gourmet & Pantry"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-overlay scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Coastal atmospheric gradient extending edge-to-edge */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#263B3F]/95 via-[#263B3F]/75 to-[#263B3F]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#263B3F]/75 via-transparent to-[#263B3F]/40" />

        {/* Inner Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#FFB94B] tracking-[0.25em] uppercase mb-3">
              <Utensils className="w-3.5 h-3.5" />
              AUSTRALIAN PANTRY & GOURMET
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-serif-brand leading-tight mb-4 text-white">
              澳洲食光：嚐嚐南半球的陽光滋味
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-white/85 leading-relaxed mb-8 max-w-xl font-light">
              原生麥蘆卡蜂蜜、有機堅果與純淨零食，把美味又健康的澳洲好味道搬上餐桌！
            </p>

            <button
              type="button"
              id="btn-banner-explore-food"
              onClick={() => onSelectCategory(foodCategoryId)}
              className="px-8 py-3.5 rounded-full bg-[#FFB94B] text-[#263B3F] text-xs md:text-sm font-bold shadow-md hover:bg-[#FFB94B]/90 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>來去逛食光選物</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden lg:flex flex-col gap-3 bg-black/25 backdrop-blur-md p-6 rounded-none border border-white/15 text-xs text-white/90 max-w-sm">
            <div className="font-semibold text-[#FFB94B] text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              純粹天然 ∙ 無多餘添加
            </div>
            <p className="text-white/75 leading-relaxed">
              波波每週嚴選澳洲在地純淨美味，讓全家人吃得開心又安心。
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. REMAINING CATEGORIES (精選主題專區 - 續): 2 columns
      ======================================================== */}
      {remainingCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {remainingCategories.map((cat) => {
              const productCount = allProducts.filter((p) =>
                isProductInCategory(p, cat)
              ).length;

              return (
                <div
                  key={cat.id}
                  id={`category-card-${cat.slug || cat.id}`}
                  onClick={() => onSelectCategory(cat.id)}
                  className="group relative rounded-none overflow-hidden cursor-pointer bg-white border border-[#263B3F]/12 shadow-[0_2px_12px_rgba(38,59,63,0.04)] hover:shadow-[0_8px_28px_rgba(38,59,63,0.1)] transition-all duration-300 flex flex-col"
                >
                  {/* Category Image */}
                  <div className="relative w-full h-56 sm:h-64 overflow-hidden rounded-none bg-[#F6F3EA]">
                    <img
                      src={cat.heroImage || cat.image_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1800&q=80'}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 rounded-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#263B3F]/85 via-[#263B3F]/25 to-transparent rounded-none" />

                    {/* Top Tag */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-white bg-[#438DB8] shadow-xs rounded-none">
                        {cat.englishName || cat.slug || 'AUSTRALIAN LIVING'}
                      </span>
                    </div>

                    {/* Item count badge */}
                    <div className="absolute bottom-3 right-4 text-[11px] text-white/90 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-none">
                      {productCount} 件選物
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-grow justify-between bg-white rounded-none">
                    <div>
                      <h3 className="text-xl font-bold text-[#263B3F] group-hover:text-[#438DB8] transition-colors font-serif-brand mb-2">
                        {cat.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#263B3F]/75 leading-relaxed line-clamp-2">
                        {cat.description || '來自澳洲海岸與陽光森林的純淨生活選物。'}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#263B3F]/10 flex items-center justify-between text-xs font-semibold text-[#438DB8]">
                      <span>進入分類瀏覽</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================
          6. CLEARANCE (限量出清特惠): Full Width Promotion Banner
      ======================================================== */}
      <section className="w-full relative bg-[#263B3F] text-white overflow-hidden py-14 md:py-20 my-0">
        {/* Atmospheric background overlay */}
        <div className="absolute inset-0 bg-radial from-[#438DB8]/15 via-transparent to-transparent pointer-events-none" />

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Area: Clearance Promo Text (5 cols) */}
            <div className="lg:col-span-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#FFB94B] bg-[#FFB94B]/15 border border-[#FFB94B]/30 tracking-widest uppercase mb-4 rounded-full">
                <Tag className="w-3.5 h-3.5" />
                LIMITED CLEARANCE
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-brand mb-4 text-white">
                限量出清特惠
              </h2>

              <p className="text-sm md:text-base text-white/80 leading-relaxed mb-6 font-light max-w-md mx-auto lg:mx-0">
                現貨搶便宜！超值出清好物數量有限，賣完就沒有囉～
              </p>

              <button
                type="button"
                id="btn-clearance-view-all"
                onClick={() => onSelectCategory(clearanceCatId)}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#FFB94B] text-[#263B3F] text-xs sm:text-sm font-bold shadow-md hover:bg-[#FFB94B]/90 transition-all cursor-pointer"
              >
                <span>搶看全部出清好物</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Area: Clearance Products (7 cols) */}
            <div className="lg:col-span-7">
              {isProductsLoading && allProducts.length === 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white/10 rounded-2xl p-5 animate-pulse h-64" />
                  ))}
                </div>
              ) : clearanceProducts.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-8 text-center text-white/80">
                  <p className="text-sm font-medium">目前清倉專區暫無出清好物</p>
                  <p className="text-xs text-white/60 mt-1">歡迎隨時逛逛其他分類好物</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:gap-6 items-stretch">
                  {clearanceProducts.map((product) => {
                    const defaultOptions: Record<string, string> = {};
                    if (product.options && product.options.length > 0) {
                      product.options.forEach((opt) => {
                        if (opt.values && opt.values.length > 0) {
                          defaultOptions[opt.name] = opt.values[0];
                        }
                      });
                    }

                    return (
                      <div
                        key={product.id}
                        id={`clearance-product-${product.id}`}
                        className="group bg-white text-[#263B3F] rounded-2xl p-4 sm:p-5 border border-white/15 shadow-lg flex flex-col justify-between transition-all hover:shadow-2xl h-full"
                      >
                        <div className="flex flex-col flex-1">
                          {/* Thumbnail */}
                          <div
                            onClick={() => onSelectProduct(product)}
                            className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#F6F3EA] mb-3.5 cursor-pointer shrink-0"
                          >
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Brand & Name */}
                          <span className="text-[10px] sm:text-[11px] font-semibold text-[#438DB8] uppercase tracking-wider block mb-1">
                            {product.brand}
                          </span>
                          <h4
                            onClick={() => onSelectProduct(product)}
                            className="text-xs sm:text-sm font-semibold text-[#263B3F] lg:line-clamp-2 mt-0.5 hover:text-[#438DB8] cursor-pointer transition-colors leading-snug break-words flex-1 mb-2"
                          >
                            {product.name}
                          </h4>
                        </div>

                        {/* Price & Add to Cart */}
                        <div className="mt-auto pt-3 border-t border-[#263B3F]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            {getProductOriginalPrice(product) && (
                              <div className="text-[10px] sm:text-xs text-[#263B3F]/40 line-through">
                                NT$ {getProductOriginalPrice(product)?.toLocaleString()}
                              </div>
                            )}
                            <div className="text-xs sm:text-sm font-bold text-[#438DB8]">
                              NT$ {getProductEffectivePrice(product).toLocaleString()}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const defaultVariant =
                                product.variants && product.variants.length > 0
                                  ? product.variants[0]
                                  : undefined;
                              addToCart(
                                product,
                                1,
                                Object.keys(defaultOptions).length > 0 ? defaultOptions : undefined,
                                defaultVariant
                              );
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#438DB8] hover:bg-[#438DB8]/90 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
                            title="加入購物車"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>加入</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. FEATURED BEAUTY (純淨美妝 / 精選美妝): 5 items
          - Desktop: 5 columns grid
          - Mobile / Tablet: Horizontal swipe carousel / slideshow (5 items)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="w-full sm:w-auto">
            {/* Row 1: [Icon] PURE BEAUTY & CARE */}
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#438DB8] tracking-widest uppercase mb-1">
              <Heart className="w-3.5 h-3.5 text-[#FFB94B]" />
              PURE BEAUTY & CARE
            </div>

            {/* Row 2: Mobile (純淨美妝保養 on left, 看更多純淨美妝 on right) | Desktop (純淨美妝保養) */}
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#263B3F] font-serif-brand">
                純淨美妝保養
              </h2>
              {/* Mobile Right Link */}
              <button
                type="button"
                id="btn-home-view-all-beauty-mobile"
                onClick={() => onSelectCategory(beautyCategoryId)}
                className="sm:hidden text-xs font-semibold text-[#438DB8] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>看更多純淨美妝</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Row 3: Subtitle */}
            <p className="text-xs sm:text-sm text-[#263B3F]/70 mt-1">
              來自澳洲天然植萃與溫和滋養，給肌膚最純粹的溫柔呵護
            </p>
          </div>

          {/* Desktop Right Link */}
          <div className="hidden sm:flex items-center justify-end gap-3 self-auto">
            <button
              type="button"
              id="btn-home-view-all-beauty"
              onClick={() => onSelectCategory(beautyCategoryId)}
              className="text-xs font-semibold text-[#438DB8] hover:underline flex items-center gap-1 self-auto cursor-pointer"
            >
              <span>看更多純淨美妝</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isProductsLoading && allProducts.length === 0 ? (
          <div className="flex items-stretch overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3.5 sm:gap-4 pb-4 pt-1 px-4 sm:px-6 -mx-4 sm:-mx-6 lg:grid lg:grid-cols-5 lg:gap-4 sm:lg:gap-5 lg:p-0 lg:m-0 lg:overflow-visible">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-[66vw] min-w-[210px] max-w-[260px] sm:w-[230px] shrink-0 snap-start bg-white rounded-xl p-3 border border-[#263B3F]/10 animate-pulse lg:w-auto lg:min-w-0 lg:max-w-none lg:shrink lg:snap-align-none"
              >
                <div className="aspect-square bg-[#263B3F]/10 rounded-lg mb-3" />
                <div className="h-3 bg-[#263B3F]/10 rounded-sm w-2/3 mb-2" />
                <div className="h-4 bg-[#263B3F]/15 rounded-sm w-full mb-3" />
                <div className="h-4 bg-[#263B3F]/20 rounded-sm w-1/2" />
              </div>
            ))}
          </div>
        ) : beautyProducts.length === 0 ? (
          <div className="py-12 text-center bg-white/60 border border-[#263B3F]/10 rounded-xl">
            <p className="text-[#263B3F]/70 text-sm">目前尚無美妝好物</p>
          </div>
        ) : (
          /* Products: Desktop 5 columns grid | Mobile Horizontal Swipe Carousel */
          <div
            className="flex items-stretch overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3.5 sm:gap-4 pb-4 pt-1 px-4 sm:px-6 -mx-4 sm:-mx-6 scroll-smooth lg:grid lg:grid-cols-5 lg:gap-4 sm:lg:gap-5 lg:p-0 lg:m-0 lg:overflow-visible"
          >
            {beautyProducts.map((product) => (
              <div
                key={product.id}
                className="w-[66vw] min-w-[210px] max-w-[260px] sm:w-[230px] shrink-0 snap-start flex flex-col self-stretch lg:w-auto lg:min-w-0 lg:max-w-none lg:shrink lg:snap-align-none"
              >
                <ProductCard
                  product={product}
                  onSelect={onSelectProduct}
                />
              </div>
            ))}
            {/* Mobile end spacer for clean right margin scroll */}
            <div className="w-4 shrink-0 lg:hidden" aria-hidden="true" />
          </div>
        )}
      </section>
    </div>
  );
};
