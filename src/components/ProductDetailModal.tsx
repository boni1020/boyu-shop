import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import {
  getVariantEffectivePrice,
  getVariantOriginalPrice,
  getProductEffectivePrice,
  getProductOriginalPrice,
  isItemOnSale,
  isItemNew,
} from '../utils/priceUtils';
import { X, Minus, Plus, ShoppingBag, Check, Sparkles, Tag, Layers } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectCategory?: (categoryId: string) => void;
  onSelectBrand?: (brand: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectCategory,
  onSelectBrand,
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Initialize selected variant and options when product opens or changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(null);
      }

      if (product.options && product.options.length > 0) {
        const initialOpts: Record<string, string> = {};
        product.options.forEach((opt) => {
          if (opt.values && opt.values.length > 0) {
            initialOpts[opt.name] = opt.values[0];
          }
        });
        setSelectedOptions(initialOpts);
      } else {
        setSelectedOptions({});
      }
    }
  }, [product]);

  if (!product) return null;

  // Active price and attributes depending on selected variant or base product
  // Rule 8: is_sale = true -> clearance_price, Rule 9: is_sale = false -> price, Rule 10: original_price
  const activePrice = getProductEffectivePrice(product, selectedVariant);
  const activeOriginalPrice = getProductOriginalPrice(product, selectedVariant);
  const activeIsNew = isItemNew(product, selectedVariant);
  const activeIsSale = isItemOnSale(product, selectedVariant);
  const activeWeight = selectedVariant && selectedVariant.weight != null
    ? `${selectedVariant.weight} kg`
    : product.weight;

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedOptions, selectedVariant || undefined);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-[#F6F3EA] rounded-2xl shadow-2xl overflow-hidden z-10 border border-[#263B3F]/15 max-h-[92vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-[#263B3F] shadow-sm transition-all focus:outline-hidden cursor-pointer"
          aria-label="關閉"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Product Image */}
        <div className="md:w-1/2 relative bg-white min-h-[280px] md:min-h-[480px] flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-[#263B3F]/10">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full max-h-[420px] object-contain transition-transform duration-500 hover:scale-105"
            referrerPolicy="no-referrer"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {activeIsNew && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#438DB8] text-white text-[11px] font-semibold tracking-wider shadow-xs">
                <Sparkles className="w-3 h-3" />
                新品上市
              </span>
            )}
            {activeIsSale && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFB94B] text-[#263B3F] text-[11px] font-bold tracking-wider shadow-xs">
                <Tag className="w-3 h-3" />
                特惠清倉
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Product Info & Purchase Action */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[520px] md:max-h-[92vh]">
          <div>
            {/* Category and Brand */}
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(product.categoryId);
                  onClose();
                }}
                className="text-xs font-semibold text-[#438DB8] hover:underline cursor-pointer"
              >
                {product.categoryName}
              </button>
              <span className="text-[#263B3F]/30">•</span>
              <button
                type="button"
                onClick={() => {
                  if (onSelectBrand) onSelectBrand(product.brand);
                  onClose();
                }}
                className="text-xs font-semibold text-[#263B3F]/75 hover:text-[#438DB8] cursor-pointer"
              >
                {product.brand}
              </button>
            </div>

            {/* Product Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-[#263B3F] font-serif-brand leading-snug mb-3">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-[#438DB8]">
                NT$ {activePrice.toLocaleString()}
              </span>
              {activeOriginalPrice && activeOriginalPrice > activePrice && (
                <span className="text-sm text-[#263B3F]/40 line-through">
                  NT$ {activeOriginalPrice.toLocaleString()}
                </span>
              )}
              {activeWeight && (
                <span className="text-xs text-[#263B3F]/60 ml-auto bg-white/70 px-2 py-0.5 rounded-md border border-[#263B3F]/10">
                  重量：{activeWeight}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-5">
              <p className="text-xs sm:text-sm text-[#263B3F]/80 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Product Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-5 bg-white/70 p-4 rounded-xl border border-[#263B3F]/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#263B3F] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#438DB8]" />
                    選擇規格 ({product.variants.length} 種可選)
                  </span>
                  {selectedVariant && (
                    <span className="text-[#438DB8] font-semibold text-xs">
                      {selectedVariant.name}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const vPrice = getVariantEffectivePrice(v);
                    const vOrigPrice = getVariantOriginalPrice(v);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantSelect(v)}
                        className={`p-2.5 rounded-xl text-left border transition-all duration-150 cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#438DB8] text-white border-[#438DB8] shadow-xs ring-2 ring-[#438DB8]/20'
                            : 'bg-white text-[#263B3F] border-[#263B3F]/15 hover:border-[#438DB8]/60 hover:bg-[#F6F3EA]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#263B3F]'}`}>
                            {v.name}
                          </span>
                          {v.is_sale && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                            }`}>
                              特惠
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline justify-between text-xs mt-0.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className={`font-bold ${isSelected ? 'text-white' : 'text-[#438DB8]'}`}>
                              NT$ {vPrice.toLocaleString()}
                            </span>
                            {vOrigPrice && vOrigPrice > vPrice && (
                              <span className={`text-[10px] line-through ${isSelected ? 'text-white/60' : 'text-[#263B3F]/40'}`}>
                                NT$ {vOrigPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {v.weight != null && (
                            <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#263B3F]/50'}`}>
                              {v.weight} kg
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Product Options Selectors (e.g., 容量、香味、尺寸、規格) */}
            {product.options && product.options.length > 0 && (
              <div className="mb-6 space-y-4 bg-white/60 p-4 rounded-xl border border-[#263B3F]/10">
                <div className="text-xs font-bold text-[#263B3F] tracking-wide flex items-center gap-1.5 uppercase">
                  <span>其他選項</span>
                </div>
                {product.options.map((option) => {
                  const currentSelected = selectedOptions[option.name] || option.values[0];
                  return (
                    <div key={option.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#263B3F]/80">
                          {option.name}：
                          <span className="font-semibold text-[#438DB8] ml-1">
                            {currentSelected}
                          </span>
                        </span>
                      </div>

                      {/* Options values pills */}
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {option.values.map((val) => {
                          const isSelected = currentSelected === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleOptionChange(option.name, val)}
                              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-150 cursor-pointer border text-left ${
                                isSelected
                                  ? 'bg-[#438DB8] text-white border-[#438DB8] shadow-xs ring-2 ring-[#438DB8]/20'
                                  : 'bg-white text-[#263B3F]/85 border-[#263B3F]/15 hover:border-[#438DB8]/60 hover:bg-[#F6F3EA]'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="pt-4 border-t border-[#263B3F]/10">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-xs font-semibold text-[#263B3F]/80">選購數量</span>
              
              {/* Quantity Picker [-] qty [+] */}
              <div className="inline-flex items-center border border-[#263B3F]/20 rounded-lg bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  id="btn-modal-qty-decrease"
                  onClick={handleDecrease}
                  className="px-3 py-2 text-[#263B3F] hover:bg-[#F6F3EA] transition-colors focus:outline-hidden disabled:opacity-30 cursor-pointer"
                  disabled={quantity <= 1}
                  aria-label="減少數量"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 py-2 text-xs font-semibold text-[#263B3F] min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  id="btn-modal-qty-increase"
                  onClick={handleIncrease}
                  className="px-3 py-2 text-[#263B3F] hover:bg-[#F6F3EA] transition-colors focus:outline-hidden cursor-pointer"
                  aria-label="增加數量"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-[#263B3F]/60 ml-auto">
                小計：<span className="font-bold text-[#438DB8]">NT$ {(activePrice * quantity).toLocaleString()}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              id="btn-modal-add-to-cart"
              onClick={handleAddToCart}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                addedFeedback
                  ? 'bg-[#2B8D9C] text-white'
                  : 'bg-[#438DB8] hover:bg-[#438DB8]/90 text-white'
              }`}
            >
              {addedFeedback ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>已加入購物車 ({quantity} 件)</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>加入購物車 ∙ NT$ {(activePrice * quantity).toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
