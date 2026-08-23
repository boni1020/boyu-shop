import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { BANK_CONFIG } from '../config/bankConfig';
import { CustomerInfo, Order } from '../types';
import { notificationService } from '../services/notificationService';
import { getCartItemUnitPrice } from '../utils/priceUtils';
import { Building2, Copy, Check, AlertCircle, ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';

interface CheckoutViewProps {
  onNavigateCart: () => void;
  onNavigateHome: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onNavigateCart,
  onNavigateHome,
  onOrderSuccess,
}) => {
  const { cart, cartTotal, clearCart } = useCart();

  // Form State
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    sevenElevenStore: '',
    transferLast5Digits: '',
  });

  // Errors State
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const freeShippingThreshold = 1500;
  const isFreeShipping = cartTotal >= freeShippingThreshold;
  const shippingFee = cart.length === 0 ? 0 : isFreeShipping ? 0 : 80;
  const finalTotal = cartTotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#263B3F] font-serif-brand mb-4">
          購物車內無商品，無法進行結帳
        </h2>
        <button
          type="button"
          onClick={onNavigateHome}
          className="px-6 py-2.5 rounded-full bg-[#438DB8] text-white text-xs font-semibold hover:bg-[#438DB8]/90"
        >
          返回商店選物
        </button>
      </div>
    );
  }

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Form input change
  const handleChange = (field: keyof CustomerInfo, value: string) => {
    // Special handling for 5 digits: allow only numbers and max 5 digits
    if (field === 'transferLast5Digits') {
      const sanitized = value.replace(/\D/g, '').slice(0, 5);
      setFormData((prev) => ({ ...prev, [field]: sanitized }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = '請填寫訂購人姓名';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '請填寫聯絡電話';
    } else if (!/^[0-9+()-\s]{8,15}$/.test(formData.phone.trim())) {
      newErrors.phone = '請輸入有效的電話號碼';
    }

    if (!formData.email.trim()) {
      newErrors.email = '請填寫 Email 電子郵件';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = '請輸入正確格式的 Email（例如：name@example.com）';
    }

    if (!formData.sevenElevenStore.trim()) {
      newErrors.sevenElevenStore = '請填寫 7-11 收件門市名稱';
    }

    if (!formData.transferLast5Digits) {
      newErrors.transferLast5Digits = '請輸入 5 位數字的匯款後五碼';
    } else if (!/^\d{5}$/.test(formData.transferLast5Digits)) {
      newErrors.transferLast5Digits = '請輸入 5 位數字的匯款後五碼';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      // Scroll to first error
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate Order ID (e.g. BY-20260814-1234)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderId = `BY-${dateStr}-${randomSuffix}`;

      const newOrder: Order = {
        id: orderId,
        createdAt: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        customer: { ...formData },
        items: [...cart],
        subtotal: cartTotal,
        shippingFee: shippingFee,
        totalAmount: finalTotal,
        status: 'pending_transfer',
      };

      // Call notification service abstraction (stores notification log & client confirmation dispatch)
      await notificationService.sendStoreOrderNotification(newOrder);
      await notificationService.sendCustomerOrderConfirmation(newOrder);

      // Clear cart
      clearCart();

      // Navigate to order success view
      onOrderSuccess(newOrder);
    } catch (err) {
      console.error('Error submitting order', err);
      alert('訂單建立失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button */}
      <button
        type="button"
        onClick={onNavigateCart}
        className="inline-flex items-center gap-1.5 text-xs text-[#263B3F]/70 hover:text-[#438DB8] mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        返回購物車修改商品
      </button>

      <div className="pb-6 border-b border-[#263B3F]/10 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#263B3F] font-serif-brand">
          訂單結帳與付款
        </h1>
        <p className="text-xs sm:text-sm text-[#263B3F]/60 mt-1">
          請核對訂購商品、匯款資訊，並填寫 7-11 門市取貨與匯款帳號後五碼。
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Bank Info & Customer Form (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Section 1: Bank Transfer Information Box */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-[#438DB8]/40 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#263B3F]/10 mb-5">
                <div className="p-2 rounded-lg bg-[#438DB8]/10 text-[#438DB8]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#263B3F]">
                    銀行轉帳匯款資訊
                  </h2>
                  <span className="text-[11px] text-[#263B3F]/60">
                    請使用 ATM / 網銀轉帳至以下指定專屬帳戶
                  </span>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-[#263B3F]">
                <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-[#F6F3EA]/70">
                  <span className="text-[#263B3F]/70 font-medium">銀行名稱</span>
                  <span className="font-bold text-sm text-[#263B3F]">
                    {BANK_CONFIG.bankName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-[#F6F3EA]/70">
                  <span className="text-[#263B3F]/70 font-medium">銀行代碼</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#438DB8]">
                      {BANK_CONFIG.bankCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(BANK_CONFIG.bankCode, 'bankCode')}
                      className="text-[11px] text-[#2B8D9C] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'bankCode' ? (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> 已複製
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5">
                          <Copy className="w-3 h-3" /> 複製
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-[#F6F3EA]/70">
                  <span className="text-[#263B3F]/70 font-medium">分行</span>
                  <span className="font-medium text-[#263B3F]">
                    {BANK_CONFIG.branchName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-[#438DB8]/10 border border-[#438DB8]/20">
                  <span className="text-[#263B3F] font-bold">匯款帳號</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-[#438DB8] tracking-wider">
                      {BANK_CONFIG.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(BANK_CONFIG.accountNumber.replace(/-/g, ''), 'accountNumber')}
                      className="px-2 py-1 rounded bg-[#438DB8] text-white text-[10px] font-semibold hover:bg-[#438DB8]/90 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'accountNumber' ? (
                        <span className="flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> 已複製
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5">
                          <Copy className="w-3 h-3" /> 複製帳號
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-[#F6F3EA]/70">
                  <span className="text-[#263B3F]/70 font-medium">戶名</span>
                  <span className="font-bold text-sm text-[#263B3F]">
                    {BANK_CONFIG.accountName}
                  </span>
                </div>
              </div>

              {BANK_CONFIG.notes && (
                <div className="mt-4 pt-3 border-t border-[#263B3F]/8 text-[11px] text-[#263B3F]/70 leading-relaxed">
                  ✦ {BANK_CONFIG.notes}
                </div>
              )}
            </div>

            {/* Section 2: Customer Info & 7-11 Store Form */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#263B3F]/12 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-[#263B3F] pb-3 border-b border-[#263B3F]/10">
                訂購人與 7-11 取貨資料
              </h2>

              {/* Name */}
              <div>
                <label htmlFor="customer-name" className="block text-xs font-semibold text-[#263B3F] mb-1.5">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="customer-name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="請輸入取件人完整真實姓名（以便超商核對證件）"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs text-[#263B3F] focus:outline-hidden focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-200 bg-red-50/30'
                      : 'border-[#263B3F]/20 focus:border-[#438DB8] focus:ring-[#438DB8]/20 bg-white'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="customer-phone" className="block text-xs font-semibold text-[#263B3F] mb-1.5">
                  電話 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="customer-phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="例如：0912-345-678（用於到貨簡訊通知）"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs text-[#263B3F] focus:outline-hidden focus:ring-2 transition-all ${
                    errors.phone
                      ? 'border-red-500 focus:ring-red-200 bg-red-50/30'
                      : 'border-[#263B3F]/20 focus:border-[#438DB8] focus:ring-[#438DB8]/20 bg-white'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="customer-email" className="block text-xs font-semibold text-[#263B3F] mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="customer-email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="例如：name@example.com（用於接收訂單確認信件）"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs text-[#263B3F] focus:outline-hidden focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-200 bg-red-50/30'
                      : 'border-[#263B3F]/20 focus:border-[#438DB8] focus:ring-[#438DB8]/20 bg-white'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* 7-11 Store Name */}
              <div>
                <label htmlFor="customer-store" className="block text-xs font-semibold text-[#263B3F] mb-1.5">
                  7-11 收件門市 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="customer-store"
                  value={formData.sevenElevenStore}
                  onChange={(e) => handleChange('sevenElevenStore', e.target.value)}
                  placeholder="請輸入 7-11 門市名稱（例如：統一超商 忠孝門市）"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs text-[#263B3F] focus:outline-hidden focus:ring-2 transition-all ${
                    errors.sevenElevenStore
                      ? 'border-red-500 focus:ring-red-200 bg-red-50/30'
                      : 'border-[#263B3F]/20 focus:border-[#438DB8] focus:ring-[#438DB8]/20 bg-white'
                  }`}
                />
                {errors.sevenElevenStore && (
                  <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.sevenElevenStore}
                  </p>
                )}
              </div>

              {/* Bank Transfer Last 5 Digits */}
              <div className="pt-2 border-t border-[#263B3F]/10">
                <label htmlFor="customer-transfer-digits" className="block text-xs font-semibold text-[#263B3F] mb-1.5">
                  匯款後五碼 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="customer-transfer-digits"
                    inputMode="numeric"
                    maxLength={5}
                    value={formData.transferLast5Digits}
                    onChange={(e) => handleChange('transferLast5Digits', e.target.value)}
                    placeholder="請輸入 5 位數字的匯款後五碼（例如：88629）"
                    className={`w-full px-4 py-2.5 font-mono text-sm tracking-widest text-[#263B3F] rounded-xl border focus:outline-hidden focus:ring-2 transition-all ${
                      errors.transferLast5Digits
                        ? 'border-red-500 focus:ring-red-200 bg-red-50/30'
                        : 'border-[#263B3F]/20 focus:border-[#438DB8] focus:ring-[#438DB8]/20 bg-white'
                    }`}
                  />
                  <span className="absolute right-3 top-3 text-[11px] text-[#263B3F]/40 font-mono">
                    {formData.transferLast5Digits.length}/5
                  </span>
                </div>
                {errors.transferLast5Digits ? (
                  <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.transferLast5Digits}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-[#263B3F]/60">
                    請輸入轉出帳號的末 5 碼數字，以便會計人員核對款項。
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Items & Submit CTA (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#263B3F]/12 shadow-sm sticky top-28 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#263B3F]/10">
                <ShoppingBag className="w-4 h-4 text-[#438DB8]" />
                <h2 className="text-base font-bold text-[#263B3F] font-serif-brand">
                  訂單商品清單 ({cart.length} 項)
                </h2>
              </div>

              {/* Items list */}
              <div className="divide-y divide-[#263B3F]/8 max-h-[320px] overflow-y-auto pr-1">
                {cart.map((cartItem) => {
                  const { cartItemId, product, quantity, selectedVariant, selectedOptions } = cartItem;
                  const unitPrice = getCartItemUnitPrice(cartItem);
                  return (
                    <div key={cartItemId} className="py-3 flex items-start gap-3">
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
                          <div className="text-[10px] text-[#438DB8] font-medium truncate mt-0.5">
                            規格: {selectedVariant.name}
                          </div>
                        )}
                        {selectedOptions && Object.keys(selectedOptions).length > 0 && (
                          <div className="text-[10px] text-[#263B3F]/60 truncate mt-0.5">
                            {Object.entries(selectedOptions)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' ∙ ')}
                          </div>
                        )}
                        <div className="text-[11px] text-[#263B3F]/60 mt-0.5">
                          NT$ {unitPrice.toLocaleString()} × {quantity}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-[#263B3F] shrink-0">
                        NT$ {(unitPrice * quantity).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Amount Breakdown */}
              <div className="pt-3 border-t border-[#263B3F]/10 space-y-2 text-xs text-[#263B3F]">
                <div className="flex justify-between">
                  <span className="text-[#263B3F]/70">商品總金額</span>
                  <span className="font-semibold">NT$ {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#263B3F]/70">7-11 運費</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-[#2B8D9C]">免運費</span>
                    ) : (
                      `NT$ ${shippingFee}`
                    )}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-[#263B3F]/10">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#263B3F]">訂單總金額</span>
                  <span className="text-2xl font-bold text-[#438DB8]">
                    NT$ {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-checkout-submit-order"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-[#438DB8] hover:bg-[#438DB8]/90 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>正在送出訂單...</span>
                ) : (
                  <span>確認送出訂單 (NT$ {finalTotal.toLocaleString()})</span>
                )}
              </button>

              <div className="pt-3 border-t border-[#263B3F]/8 flex items-center gap-2 text-[11px] text-[#263B3F]/60">
                <ShieldCheck className="w-4 h-4 text-[#2B8D9C] shrink-0" />
                <span>送出訂單後，店家將進行對帳並安排 7-11 出貨</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
