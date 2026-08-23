import React from 'react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { getCartItemUnitPrice, getCartItemOriginalPrice } from '../utils/priceUtils';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

interface CartViewProps {
  onNavigateCheckout: () => void;
  onNavigateHome: () => void;
  onSelectProduct: (product: Product) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  onNavigateCheckout,
  onNavigateHome,
  onSelectProduct,
}) => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartItemCount } = useCart();

  const freeShippingThreshold = 1500;
  const isFreeShipping = cartTotal >= freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);
  const shippingFee = cart.length === 0 ? 0 : isFreeShipping ? 0 : 80;
  const finalTotal = cartTotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#438DB8]/10 text-[#438DB8] flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-[#263B3F] font-serif-brand mb-2">
          您的購物車目前是空的
        </h2>
        <p className="text-sm text-[#263B3F]/70 max-w-md mx-auto mb-8">
          探索來自澳洲海岸與山脈的純淨選物，將日光、沙灘與植萃日常帶入生活。
        </p>
        <button
          type="button"
          id="btn-cart-empty-explore"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#438DB8] text-white font-semibold text-sm shadow-md hover:bg-[#438DB8]/90 transition-all cursor-pointer"
        >
          <span>開始探索選物</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Title & Item Count */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-[#263B3F]/10 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#263B3F] font-serif-brand">
            購物車清單
          </h1>
          <p className="text-xs sm:text-sm text-[#263B3F]/60 mt-1">
            共選購了 <span className="font-semibold text-[#438DB8]">{cartItemCount}</span> 件澳洲海岸選物
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-[#263B3F]/50 hover:text-red-600 transition-colors self-start sm:self-auto cursor-pointer"
        >
          清空購物車
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-white rounded-xl p-4 border border-[#263B3F]/10 mb-8 shadow-xs">
        <div className="flex items-center justify-between text-xs font-medium mb-2">
          <div className="flex items-center gap-2 text-[#263B3F]">
            <Truck className="w-4 h-4 text-[#438DB8]" />
            {isFreeShipping ? (
              <span className="text-[#2B8D9C] font-semibold">
                恭喜！您的訂單已達 NT$ 1,500 免運門檻
              </span>
            ) : (
              <span>
                再消費 <span className="font-bold text-[#438DB8]">NT$ {remainingForFreeShipping.toLocaleString()}</span> 即享全台免運
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#263B3F]/50">滿 NT$ 1,500 免運</span>
        </div>
        <div className="w-full bg-[#F6F3EA] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#438DB8] h-full transition-all duration-300 rounded-full"
            style={{
              width: `${Math.min(100, (cartTotal / freeShippingThreshold) * 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((cartItem) => {
            const { cartItemId, product, quantity, selectedVariant, selectedOptions } = cartItem;
            const unitPrice = getCartItemUnitPrice(cartItem);
            const originalPrice = getCartItemOriginalPrice(cartItem);
            const subtotal = unitPrice * quantity;
            const hasDiscount = originalPrice != null && originalPrice > unitPrice;

            return (
              <div
                key={cartItemId}
                id={`cart-item-${cartItemId}`}
                className="bg-white rounded-xl p-4 sm:p-5 border border-[#263B3F]/10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all"
              >
                {/* Product Thumbnail */}
                <div
                  onClick={() => onSelectProduct(product)}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-[#F6F3EA] overflow-hidden shrink-0 cursor-pointer border border-[#263B3F]/5"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <span className="text-[11px] font-semibold tracking-wider text-[#438DB8] uppercase">
                    {product.brand}
                  </span>
                  <h3
                    onClick={() => onSelectProduct(product)}
                    className="text-sm sm:text-base font-medium text-[#263B3F] hover:text-[#438DB8] transition-colors line-clamp-1 cursor-pointer"
                  >
                    {product.name}
                  </h3>

                  {/* Variant & Selected Options Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedVariant && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#438DB8]/10 border border-[#438DB8]/20 text-[11px] font-medium text-[#438DB8]">
                        規格: {selectedVariant.name}
                      </span>
                    )}
                    {selectedOptions &&
                      Object.entries(selectedOptions).map(([optName, optVal]) => (
                        <span
                          key={optName}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F6F3EA] border border-[#263B3F]/10 text-[11px] text-[#263B3F]/80"
                        >
                          <span className="text-[#263B3F]/50 mr-1">{optName}:</span> {optVal}
                        </span>
                      ))}
                  </div>

                  <div className="flex items-baseline gap-2 text-xs text-[#263B3F]/60 mt-1">
                    <span>單價：NT$ {unitPrice.toLocaleString()}</span>
                    {hasDiscount && (
                      <span className="text-[11px] text-[#263B3F]/40 line-through">
                        NT$ {originalPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#263B3F]/8">
                  {/* Quantity picker */}
                  <div className="inline-flex items-center border border-[#263B3F]/20 rounded-lg bg-white overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => updateQuantity(cartItemId, quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-2.5 py-1.5 text-[#263B3F] hover:bg-[#F6F3EA] disabled:opacity-30 transition-colors cursor-pointer"
                      aria-label="減少"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 py-1 text-xs font-semibold text-[#263B3F] min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(cartItemId, quantity + 1)}
                      className="px-2.5 py-1.5 text-[#263B3F] hover:bg-[#F6F3EA] transition-colors cursor-pointer"
                      aria-label="增加"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[5rem]">
                    <div className="text-sm sm:text-base font-bold text-[#263B3F]">
                      NT$ {subtotal.toLocaleString()}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(cartItemId)}
                    className="p-2 text-[#263B3F]/40 hover:text-red-600 transition-colors cursor-pointer"
                    aria-label="移除商品"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs font-medium text-[#438DB8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              ← 繼續選購其他商品
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-6 border border-[#263B3F]/12 shadow-sm sticky top-28">
            <h2 className="text-lg font-bold text-[#263B3F] font-serif-brand pb-4 border-b border-[#263B3F]/10">
              訂單金額摘要
            </h2>

            <div className="space-y-3 py-4 text-xs text-[#263B3F]">
              <div className="flex justify-between">
                <span className="text-[#263B3F]/70">商品總金額</span>
                <span className="font-semibold">NT$ {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#263B3F]/70">全台運費</span>
                <span className="font-semibold">
                  {shippingFee === 0 ? (
                    <span className="text-[#2B8D9C]">免運費</span>
                  ) : (
                    `NT$ ${shippingFee}`
                  )}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#263B3F]/10 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#263B3F]">應付總金額</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#438DB8]">
                    NT$ {finalTotal.toLocaleString()}
                  </span>
                  <div className="text-[10px] text-[#263B3F]/50">含稅及全台配送</div>
                </div>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              type="button"
              id="btn-cart-proceed-checkout"
              onClick={onNavigateCheckout}
              className="w-full py-3.5 px-6 rounded-xl bg-[#438DB8] hover:bg-[#438DB8]/90 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>前往結帳</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-4 pt-4 border-t border-[#263B3F]/8 flex items-center gap-2 text-[11px] text-[#263B3F]/60">
              <ShieldCheck className="w-4 h-4 text-[#2B8D9C] shrink-0" />
              <span>支援 7-11 取貨與 ATM 銀行轉帳驗證</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
