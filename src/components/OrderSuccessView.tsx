import React from 'react';
import { Order } from '../types';
import { BANK_CONFIG } from '../config/bankConfig';
import { getCartItemUnitPrice } from '../utils/priceUtils';
import { CheckCircle2, PackageCheck, MapPin, CreditCard, ArrowRight, ShoppingBag } from 'lucide-react';

interface OrderSuccessViewProps {
  order: Order | null;
  onNavigateHome: () => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  order,
  onNavigateHome,
}) => {
  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#263B3F] mb-4">查無訂單資訊</h2>
        <button
          type="button"
          onClick={onNavigateHome}
          className="px-6 py-2.5 rounded-full bg-[#438DB8] text-white text-xs font-semibold"
        >
          返回首頁
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Success Badge & Headline */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <span className="inline-block text-xs font-semibold text-[#438DB8] tracking-widest uppercase mb-1">
          THANK YOU FOR YOUR ORDER
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#263B3F] font-serif-brand mb-3">
          訂單已送出
        </h1>
        <p className="text-xs sm:text-sm text-[#263B3F]/75 max-w-md mx-auto leading-relaxed">
          我們會確認您的匯款資訊，確認後安排後續出貨。
        </p>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-2xl border border-[#263B3F]/12 shadow-sm overflow-hidden mb-8">
        {/* Order Header Summary Banner */}
        <div className="p-6 bg-[#438DB8] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-white/80">
              訂單編號
            </span>
            <div className="text-lg sm:text-xl font-mono font-bold">
              {order.id}
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-[11px] uppercase tracking-wider text-white/80">
              訂單總金額
            </span>
            <div className="text-xl sm:text-2xl font-bold">
              NT$ {order.totalAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Order Details & Delivery Info */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Customer & Shipping Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F6F3EA]/70 text-xs text-[#263B3F]">
            <div>
              <span className="text-[#263B3F]/60 block mb-0.5">訂購人姓名</span>
              <span className="font-semibold text-sm text-[#263B3F]">{order.customer.name}</span>
            </div>
            <div>
              <span className="text-[#263B3F]/60 block mb-0.5">聯絡電話</span>
              <span className="font-medium text-[#263B3F]">{order.customer.phone}</span>
            </div>
            <div>
              <span className="text-[#263B3F]/60 block mb-0.5">Email</span>
              <span className="font-medium text-[#263B3F] truncate block">{order.customer.email}</span>
            </div>
            <div>
              <span className="text-[#263B3F]/60 block mb-0.5">7-11 收件門市</span>
              <span className="font-semibold text-sm text-[#263B3F] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#438DB8]" />
                {order.customer.sevenElevenStore}
              </span>
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-[#263B3F]/8 flex items-center justify-between">
              <span className="text-[#263B3F]/70 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#438DB8]" />
                已填寫匯款後五碼：
              </span>
              <span className="font-mono font-bold text-sm text-[#438DB8] bg-white px-3 py-1 rounded-md border border-[#438DB8]/20">
                {order.customer.transferLast5Digits}
              </span>
            </div>
          </div>

          {/* Ordered Items List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#263B3F]/70 mb-3 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-[#438DB8]" />
              訂單商品明細 ({order.items.length} 件商品)
            </h3>

            <div className="divide-y divide-[#263B3F]/8 border-y border-[#263B3F]/8">
              {order.items.map((item) => {
                const { cartItemId, product, quantity, selectedVariant, selectedOptions } = item;
                const unitPrice = getCartItemUnitPrice(item);
                return (
                  <div key={cartItemId || product.id} className="py-3.5 flex items-start gap-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg bg-[#F6F3EA] shrink-0 border border-[#263B3F]/5 mt-0.5"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-grow min-w-0">
                      <div className="text-xs font-semibold text-[#263B3F] truncate">
                        {product.name}
                      </div>
                      {selectedVariant && (
                        <div className="text-[11px] text-[#438DB8] font-medium mt-0.5">
                          規格: {selectedVariant.name}
                        </div>
                      )}
                      {selectedOptions && Object.keys(selectedOptions).length > 0 && (
                        <div className="text-[11px] text-[#263B3F]/70 mt-0.5">
                          {Object.entries(selectedOptions)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' ∙ ')}
                        </div>
                      )}
                      <div className="text-[11px] text-[#2B8D9C] mt-0.5">
                        {product.brand} ∙ NT$ {unitPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-[#263B3F]">數量：{quantity}</div>
                      <div className="text-xs font-bold text-[#438DB8]">
                        小計 NT$ {(unitPrice * quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="space-y-2 text-xs text-[#263B3F] pt-2">
            <div className="flex justify-between">
              <span className="text-[#263B3F]/70">商品總金額</span>
              <span>NT$ {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#263B3F]/70">7-11 運費</span>
              <span>NT$ {order.shippingFee}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-2 border-t border-[#263B3F]/10">
              <span>訂單金額總計</span>
              <span className="text-[#438DB8] font-mono text-base">
                NT$ {order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Bank reminder note */}
          <div className="p-4 rounded-xl bg-[#438DB8]/8 border border-[#438DB8]/20 text-xs text-[#263B3F] leading-relaxed">
            <span className="font-semibold text-[#438DB8] block mb-1">✦ 匯款與出貨提醒：</span>
            若您尚未完成轉帳，請將款項匯至玉山銀行（808）帳號：{BANK_CONFIG.accountNumber}。我們會確認您的匯款資訊，確認後將發送 7-11 物流編號並安排後續出貨。
          </div>
        </div>
      </div>

      {/* Return Home Button */}
      <div className="text-center">
        <button
          type="button"
          id="btn-order-success-return-home"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#438DB8] text-white font-semibold text-sm shadow-md hover:bg-[#438DB8]/90 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>返回首頁商品目錄</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
