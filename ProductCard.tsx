/** @format */

import { Link } from "react-router-dom";
import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="flex w-45 md:w-[220px] flex-col overflow-hidden "
    >
      <div className="relative aspect-square w-full bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />

        {/* 左上角特價 (預留位置，不可見) */}
        {/* <span className=" absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#e11d48] text-[10px] font-bold ">
          50%
        </span> */}

        {/* 右上角最愛 (預留位置，不可見) */}
        {/* <button className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button> */}
      </div>

      <div className="flex flex-col p-3">
        <p className="text-h4">{product.name}</p>

        <div className="mt-2 flex items-end justify-between">
          <p className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-bold ">${product.price}</span>
            {/* 視覺示意用的原價，若資料無此欄位可拿掉 */}
            {/* <span className="text-xs text-gray-400 line-through">${product.price * 1.2}</span> */}
          </p>

          {/* 右下角購物車 (預留位置，維持空間但不可見) */}
          {/* <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary text-white">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button> */}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
