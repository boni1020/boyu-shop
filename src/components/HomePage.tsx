import React from 'react';
import { CategoryId, Product } from '../types';
import { ProductCard } from './ProductCard';
import { ArrowRight, Sparkles, Tag, ShoppingBag, Utensils, AlertCircle, RefreshCw } from 'lucide-react';
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

  const handleGlobalRetry = () => {
    refetchCategories();
    refetchProducts();
  };

  // 1. New Arrival Products for Section 1
  const newArrivals = React.useMemo(() => {
    const list = allProducts.filter(
      (p) =>
        p.isNewArrival ||
        p.categoryId === 'new-arrivals' ||
        p.categorySlug === 'new' ||
        p.categoryName.includes('新品')
    );
    // If no explicit isNewArrival tagged, show first 6 products
    return (list.length > 0 ? list : allProducts).slice(0, 6);
  }, [allProducts]);

  // 2. Curated Categories for Section 3 (All active EXCEPT clearance)
  const curatedCategories = React.useMemo(() => {
    return categories.filter(
      (c) =>
        c.slug !== 'clearance' &&
        c.slug !== 'sale' &&
        !c.name.includes('清倉')
    );
  }, [categories]);

  // 3. Clearance Products for Section 4
  const clearanceProducts = React.useMemo(() => {
    const list = allProducts.filter(
      (p) =>
        p.isClearance ||
        p.categoryId === 'clearance' ||
        p.categorySlug === 'sale' ||
        p.categoryName.includes('清倉') ||
        (p.originalPrice && p.originalPrice > p.price)
    );
    return list.slice(0, 2);
  }, [allProducts]);

  // Target ID for explore button
  const exploreCategoryId = React.useMemo(() => {
    const lifeCat = categories.find(
      (c) => c.name === '生活補給' || c.slug === 'life' || c.slug === 'healthy'
    );
    return lifeCat ? lifeCat.id : 'life';
  }, [categories]);

  // Target ID for food pantry
  const foodCategoryId = React.useMemo(() => {
    const foodCat = categories.find(
      (c) => c.name === '食光選物' || c.slug === 'food-pantry' || c.slug === 'food'
    );
    return foodCat ? foodCat.id : 'food-pantry';
  }, [categories]);

  // Target ID for clearance category
  const clearanceCatId = React.useMemo(() => {
    const clearanceCat = categories.find(
      (c) => c.name.includes('清倉') || c.slug === 'clearance' || c.slug === 'sale'
    );
    return clearanceCat ? clearanceCat.id : 'clearance';
  }, [categories]);

  const activeError = productsError || categoriesError;

  return (
    <div className="w-full pb-0">
      {/* Global Supabase Error Alert if connection fails */}
      {activeError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-red-800 text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>資料讀取發生異常：{activeError}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          0. HERO SECTION: Australian Coastal Nature
      ======================================================== */}
      <section className="relative min-h-[460px] md:min-h-[540px] w-full bg-[#438DB8] overflow-hidden flex items-center">
        {/* Background Image with ocean sunlight */}
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-multiply scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Atmospheric gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#263B3F]/90 via-[#263B3F]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#263B3F]/80 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-white w-full">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white font-serif-brand leading-[1.15] mb-6">
              拾起澳洲的純淨日常
            </h1>

            <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-xl mb-8 font-light">
              波嶼將南半球不受拘束的純淨生活感，化為溫潤日常
            </p>

            <div className="flex items-center gap-4">
              <button
                type="button"
                id="btn-hero-explore-life"
                onClick={() => onSelectCategory(exploreCategoryId)}
                className="px-7 py-3.5 rounded-full bg-[#438DB8] text-white text-xs md:text-sm font-semibold shadow-lg hover:bg-[#438DB8]/90 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>前往生活補給</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          1. HERO 下方第一個區塊：新品上市 (顯示 Supabase 新品)
          - Desktop: 6 columns
          - Tablet: 3 columns
          - Mobile: 2 columns
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-18">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#438DB8] tracking-widest uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB94B]" />
              NEW ARRIVALS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#263B3F] font-serif-brand">
              新品上市
            </h2>
            <p className="text-xs sm:text-sm text-[#263B3F]/70 mt-1">
              本季最新抵台的澳洲選物
            </p>
          </div>

          <button
            type="button"
            id="btn-home-view-all-new-arrivals"
            onClick={() => {
              const newCat = categories.find(
                (c) => c.name.includes('新品') || c.slug === 'new-arrivals' || c.slug === 'new'
              );
              onSelectCategory(newCat ? newCat.id : 'new-arrivals');
            }}
            className="text-xs font-semibold text-[#438DB8] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>查看全部新品上市</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading Skeletons */}
        {isProductsLoading && allProducts.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-[#263B3F]/10 animate-pulse">
                <div className="aspect-square bg-[#263B3F]/10 rounded-lg mb-3" />
                <div className="h-3 bg-[#263B3F]/10 rounded-sm w-2/3 mb-2" />
                <div className="h-4 bg-[#263B3F]/15 rounded-sm w-full mb-3" />
                <div className="h-4 bg-[#263B3F]/20 rounded-sm w-1/2" />
              </div>
            ))}
          </div>
        ) : newArrivals.length === 0 ? (
          <div className="py-12 text-center bg-white/60 border border-[#263B3F]/10 rounded-xl">
            <p className="text-[#263B3F]/70 text-sm">目前尚無新品上架</p>
          </div>
        ) : (
          /* Products Grid: Desktop 6 cols | Tablet 3 cols | Mobile 2 cols */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* ========================================================
          2. HERO 下方第二個區塊：食光選物廣告 (Full Width Lifestyle Banner)
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
              食光選物：品嚐南半球的陽光與豐饒大地
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-white/85 leading-relaxed mb-8 max-w-xl font-light">
              原生麥蘆卡蜂蜜、澳洲有機堅果，點亮每一日的餐桌食光。
            </p>

            <button
              type="button"
              id="btn-banner-explore-food"
              onClick={() => onSelectCategory(foodCategoryId)}
              className="px-8 py-3.5 rounded-full bg-[#FFB94B] text-[#263B3F] text-xs md:text-sm font-bold shadow-md hover:bg-[#FFB94B]/90 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>探索食光選物</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden lg:flex flex-col gap-3 bg-black/25 backdrop-blur-md p-6 rounded-none border border-white/15 text-xs text-white/90 max-w-sm">
            <div className="font-semibold text-[#FFB94B] text-sm">純粹天然 ∙ 無人工添加</div>
            <p className="text-white/75 leading-relaxed">
              嚴選澳洲在地純淨生產，讓每一口都嚐得到純粹的自然原味。
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. HERO 下方第三個區塊：選物分類 (From Supabase categories)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#438DB8] font-semibold block mb-1">
            CURATED CATEGORIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263B3F] font-serif-brand">
            探索澳洲選物
          </h2>
          <p className="text-xs md:text-sm text-[#263B3F]/70 mt-1">
            南半球的自然與生活的風格主題
          </p>
        </div>

        {/* Loading State Skeleton */}
        {isCategoriesLoading && curatedCategories.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
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
          /* Category Cards Grid: Desktop 3 cols | Tablet 2 cols | Mobile 1 col (rounded-none) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {curatedCategories.map((cat) => {
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
                  {/* Category Image - Strict rounded-none */}
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
                    <div className="absolute bottom-3 right-4 text-[11px] text-white/90 bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-none">
                      {productCount} 件選物
                    </div>
                  </div>

                  {/* Card Content - Strict rounded-none */}
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
          4. HERO 下方第四個區塊：清倉特價 (Full Width Promotion Banner)
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
                清倉特價
              </h2>

              <p className="text-sm md:text-base text-white/80 leading-relaxed mb-6 font-light max-w-md mx-auto lg:mx-0">
                限量選物，售完為止。換季與典藏庫存出清，以最心動價格收藏純淨生活。
              </p>

              <button
                type="button"
                id="btn-clearance-view-all"
                onClick={() => onSelectCategory(clearanceCatId)}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#FFB94B] text-[#263B3F] text-xs sm:text-sm font-bold shadow-md hover:bg-[#FFB94B]/90 transition-all cursor-pointer"
              >
                <span>查看全部特惠選物</span>
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
                <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-8 text-center text-white/80">
                  <p className="text-sm font-medium">目前清倉專區暫無出清選物</p>
                  <p className="text-xs text-white/60 mt-1">歡迎隨時瀏覽其他分類商品</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {clearanceProducts.map((product) => {
                    const defaultOptions: Record<string, string> = {};
                    if (product.options && product.options.length > 0) {
                      product.options.forEach((opt) => {
                        if (opt.values.length > 0) {
                          defaultOptions[opt.name] = opt.values[0];
                        }
                      });
                    }

                    return (
                      <div
                        key={product.id}
                        id={`clearance-product-${product.id}`}
                        className="group bg-white text-[#263B3F] rounded-2xl p-4 sm:p-5 border border-white/15 shadow-lg flex flex-col justify-between transition-all hover:shadow-2xl"
                      >
                        <div>
                          {/* Thumbnail */}
                          <div
                            onClick={() => onSelectProduct(product)}
                            className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#F6F3EA] mb-3.5 cursor-pointer"
                          >
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Brand & Name */}
                          <span className="text-[10px] sm:text-[11px] font-semibold text-[#438DB8] uppercase tracking-wider block">
                            {product.brand}
                          </span>
                          <h4
                            onClick={() => onSelectProduct(product)}
                            className="text-xs sm:text-sm font-semibold text-[#263B3F] line-clamp-2 mt-0.5 hover:text-[#438DB8] cursor-pointer transition-colors"
                          >
                            {product.name}
                          </h4>
                        </div>

                        {/* Price & Add to Cart */}
                        <div className="mt-3 pt-3 border-t border-[#263B3F]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
    </div>
  );
};
