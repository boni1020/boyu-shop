import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import {
  getProductEffectivePrice,
  getProductNormalPrice,
  isItemNew,
  isItemOnSale,
} from '../utils/priceUtils';
import { MapPin, Sparkles, Eye, ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [added, setAdded] = useState(false);

  // Price calculations
  const effectivePrice = getProductEffectivePrice(product);
  const normalPrice = getProductNormalPrice(product);
  const isSale = isItemOnSale(product);
  const isNew = isItemNew(product);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultOptions: Record<string, string> = {};
    if (product.options && product.options.length > 0) {
      product.options.forEach((opt) => {
        if (opt.values && opt.values.length > 0) {
          defaultOptions[opt.name] = opt.values[0];
        }
      });
    }
    const defaultVariant =
      product.variants && product.variants.length > 0 ? product.variants[0] : undefined;
    addToCart(
      product,
      1,
      Object.keys(defaultOptions).length > 0 ? defaultOptions : undefined,
      defaultVariant
    );
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col h-full bg-white rounded-xl overflow-hidden border border-[#263B3F]/8 shadow-[0_2px_12px_rgba(38,59,63,0.04)] hover:shadow-[0_8px_24px_rgba(38,59,63,0.08)] transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative w-full h-[220px] lg:h-auto lg:aspect-[4/3.8] shrink-0 overflow-hidden bg-[#F6F3EA]/60">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-[#263B3F]/5 animate-pulse" />
        )}

        <img
          src={isHovered && product.hoverImageUrl ? product.hoverImageUrl : product.imageUrl}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={`h-full w-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isNew && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#438DB8] text-white shadow-sm tracking-wider">
              <Sparkles className="w-3 h-3" />
              新品
            </span>
          )}
        </div>

        {/* Action Overlay on Desktop Hover */}
        <div className="absolute inset-0 bg-[#263B3F]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-3">
          <button
            type="button"
            id={`btn-quick-view-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/95 text-[#263B3F] text-xs font-semibold rounded-full shadow-md backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#F6F3EA] cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>查看細節</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4 md:p-5 justify-between">
        <div className="flex flex-col flex-1">
          {/* Brand & Origin Row */}
          <div className="flex items-center justify-between text-xs text-[#263B3F]/65 mb-1.5 shrink-0">
            <span className="font-semibold tracking-wider text-[#438DB8] uppercase text-[11px]">
              {product.brand}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#263B3F]/60">
              <MapPin className="w-3 h-3 text-[#438DB8]" />
              {product.origin.split(',')[0]}
            </span>
          </div>

          {/* Product Title - full display on mobile, pushes down evenly */}
          <div className="flex-1 flex flex-col justify-start">
            <h3 className="text-sm md:text-[15px] font-medium text-[#263B3F] lg:line-clamp-2 mb-2 group-hover:text-[#438DB8] transition-colors leading-snug break-words">
              {product.name}
            </h3>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-xs text-[#263B3F]/60 line-clamp-1 mb-3 shrink-0">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Price & Mobile Add to Cart */}
        <div className="mt-auto pt-3 border-t border-[#263B3F]/8 flex items-center justify-between gap-2 shrink-0">
          <div className="flex flex-col">
            <span className={`text-base md:text-lg font-bold tracking-tight ${isSale ? 'text-[#438DB8]' : 'text-[#263B3F]'}`}>
              NT$ {effectivePrice.toLocaleString()}
            </span>
            {isSale && normalPrice > effectivePrice && (
              <span className="text-[11px] text-[#263B3F]/50">
                正常售價 NT$ {normalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Quick Add Button (Always visible on mobile or compact) */}
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`p-2 rounded-lg transition-colors cursor-pointer md:hidden ${
              added
                ? 'bg-[#2B8D9C] text-white'
                : 'bg-[#438DB8]/10 text-[#438DB8] hover:bg-[#438DB8] hover:text-white'
            }`}
            aria-label="加入購物車"
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
