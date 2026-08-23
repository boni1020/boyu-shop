import React, { useState, useEffect } from 'react';
import { CategoryId, Product, Order, Category } from './types';
import { CartProvider } from './context/CartContext';
import { CategoryProvider, useCategories } from './context/CategoryContext';
import { ProductProvider, useProducts } from './context/ProductContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { CategoryLayout } from './components/CategoryLayout';
import { SearchResults } from './components/SearchResults';
import { CartView } from './components/CartView';
import { CheckoutView } from './components/CheckoutView';
import { OrderSuccessView } from './components/OrderSuccessView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { Footer } from './components/Footer';

function AppContent() {
  const { categories, isLoading: isCategoriesLoading, getCategoryByIdOrSlug } = useCategories();
  const { products, isLoading: isProductsLoading } = useProducts();

  // App View State: 'home' | 'category' | 'search' | 'cart' | 'checkout' | 'order-success'
  const [currentView, setCurrentView] = useState<
    'home' | 'category' | 'search' | 'cart' | 'checkout' | 'order-success'
  >('home');
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId>('life');

  // Brand filter state per category (defaults to 'all' on entry)
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected product for detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Last submitted Order for order-success view
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Active category object from Supabase Context (Strict: No fake fallback)
  const currentCategory: Category = React.useMemo(() => {
    const found = getCategoryByIdOrSlug(activeCategoryId);
    if (found) return found;
    if (categories.length > 0) return categories[0];
    return {
      id: activeCategoryId,
      name: '澳洲選品',
      slug: String(activeCategoryId),
      description: '探索來自南半球大自然的純淨生活選物。',
      is_active: true,
    };
  }, [activeCategoryId, getCategoryByIdOrSlug, categories]);

  // Handler: Navigate to a category
  const handleSelectCategory = (categoryId: CategoryId) => {
    setActiveCategoryId(categoryId);
    setSelectedBrand('all');
    setCurrentView('category');
    window.location.hash = `category/${categoryId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Brand filter changed within current category
  const handleSelectBrand = (brandName: string) => {
    setSelectedBrand(brandName);
  };

  // Handler: Trigger Search
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query.trim());
    setCurrentView('search');
    window.location.hash = `search/${encodeURIComponent(query.trim())}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Navigate to Home
  const handleNavigateHome = () => {
    setCurrentView('home');
    setSelectedBrand('all');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Navigate to Cart (/cart)
  const handleNavigateCart = () => {
    setCurrentView('cart');
    window.location.hash = 'cart';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Navigate to Checkout (/checkout)
  const handleNavigateCheckout = () => {
    setCurrentView('checkout');
    window.location.hash = 'checkout';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Order Success (/order-success)
  const handleOrderSuccess = (order: Order) => {
    setLastOrder(order);
    setCurrentView('order-success');
    window.location.hash = 'order-success';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Synchronize browser history / URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'cart') {
        setCurrentView('cart');
      } else if (hash === 'checkout') {
        setCurrentView('checkout');
      } else if (hash === 'order-success') {
        setCurrentView('order-success');
      } else if (hash.startsWith('category/')) {
        const catId = hash.replace('category/', '') as CategoryId;
        const exists = getCategoryByIdOrSlug(catId);
        if (exists) {
          setActiveCategoryId(exists.id);
          setSelectedBrand('all');
          setCurrentView('category');
        }
      } else if (hash.startsWith('search/')) {
        const q = decodeURIComponent(hash.replace('search/', ''));
        if (q) {
          setSearchQuery(q);
          setCurrentView('search');
        }
      } else if (hash === '' || hash === 'home') {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [getCategoryByIdOrSlug]);

  const isGlobalLoading = isCategoriesLoading || isProductsLoading;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EA] text-[#263B3F]">
      {/* Top subtle loading indicator if categories or products are refreshing */}
      {isGlobalLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-[#438DB8]/20 overflow-hidden">
          <div className="h-full bg-[#438DB8] w-1/3 animate-pulse" />
        </div>
      )}

      {/* Header & Main Navigation */}
      <Navbar
        currentView={currentView}
        activeCategoryId={activeCategoryId}
        onNavigateHome={handleNavigateHome}
        onNavigateCart={handleNavigateCart}
        onSelectCategory={handleSelectCategory}
        onSearch={handleSearch}
      />

      {/* Main Dynamic View */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <HomePage
            allProducts={products}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={setSelectedProduct}
          />
        )}

        {currentView === 'category' && (
          <CategoryLayout
            key={currentCategory.id}
            category={currentCategory}
            allProducts={products}
            selectedBrand={selectedBrand}
            onSelectBrand={handleSelectBrand}
            onSelectProduct={setSelectedProduct}
            onNavigateHome={handleNavigateHome}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {currentView === 'search' && (
          <SearchResults
            searchQuery={searchQuery}
            allProducts={products}
            onSelectProduct={setSelectedProduct}
            onNavigateHome={handleNavigateHome}
            onSelectCategory={handleSelectCategory}
            onSearchChange={setSearchQuery}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            onNavigateCheckout={handleNavigateCheckout}
            onNavigateHome={handleNavigateHome}
            onSelectProduct={setSelectedProduct}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            onNavigateCart={handleNavigateCart}
            onNavigateHome={handleNavigateHome}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentView === 'order-success' && (
          <OrderSuccessView
            order={lastOrder}
            onNavigateHome={handleNavigateHome}
          />
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectCategory={(catId) => handleSelectCategory(catId as CategoryId)}
        onSelectBrand={(brand) => {
          setSelectedBrand(brand);
          if (currentView !== 'category') {
            const prod = products.find(
              (p) => p.brand.toLowerCase() === brand.toLowerCase()
            );
            if (prod) {
              const matchedCat = getCategoryByIdOrSlug(prod.categoryId);
              setActiveCategoryId(matchedCat ? matchedCat.id : prod.categoryId);
            }
            setCurrentView('category');
          }
        }}
      />

      {/* Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onNavigateHome={handleNavigateHome}
      />
    </div>
  );
}

export default function App() {
  return (
    <CategoryProvider>
      <ProductProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ProductProvider>
    </CategoryProvider>
  );
}
