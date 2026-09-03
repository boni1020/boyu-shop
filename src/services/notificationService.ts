import { Order } from '../types';
import { getCartItemUnitPrice } from '../utils/priceUtils';
/**
 * 訂單通知內容介面 - 店家通知
 */
export interface StoreOrderNotificationPayload {
  orderId: string;
  orderTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  sevenElevenStore: string;
  transferLast5Digits: string;
  items: Array<{
    productId: string;
    productName: string;
    brand: string;
    variantName?: string;
    selectedOptions?: Record<string, string>;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
}

/**
 * 訂單明細內容介面 - 客戶確認信
 */
export interface CustomerOrderConfirmationPayload {
  orderId: string;
  customerName: string;
  customerEmail: string;
  sevenElevenStore: string;
  transferLast5Digits: string;
  items: Array<{
    productName: string;
    variantName?: string;
    selectedOptions?: Record<string, string>;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
}

/**
 * 訂單通知服務介面 (Notification Service Abstraction)
 * 
 * 抽象化通知傳送邏輯，以便未來接入 Supabase Edge Functions、Resend、SendGrid 或 Webhooks。
 */
export interface INotificationService {
  sendStoreOrderNotification(order: Order): Promise<{ success: boolean; message: string }>;
  sendCustomerOrderConfirmation(order: Order): Promise<{ success: boolean; message: string }>;
}

/**
 * Mock Notification Service Implementation
 */
class NotificationService implements INotificationService {
  /**
   * 1. 寄送店家訂單通知
   */
  async sendStoreOrderNotification(order: Order): Promise<{ success: boolean; message: string }> {
    const payload: StoreOrderNotificationPayload = {
      orderId: order.id,
      orderTime: order.createdAt,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      customerEmail: order.customer.email,
      sevenElevenStore: order.customer.sevenElevenStore,
      transferLast5Digits: order.customer.transferLast5Digits,
      items: order.items.map((item) => {
        const unitPrice = getCartItemUnitPrice(item);
        return {
          productId: item.product.id,
          productName: item.product.name,
          brand: item.product.brand,
          variantName: item.selectedVariant?.name,
          selectedOptions: item.selectedOptions,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      }),
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      totalAmount: order.totalAmount,
    };

    // In local development / mock phase: log formatted payload to console for inspection
    console.log('[NotificationService] Store Order Notification queued:', payload);
    
    // Simulate async dispatch
    return Promise.resolve({
      success: true,
      message: `店家訂單通知已建立 (訂單編號: ${order.id})`,
    });
  }

  /**
   * 2. 寄送客戶訂單明細
   */
  async sendCustomerOrderConfirmation(order: Order): Promise<{ success: boolean; message: string }> {
    const payload: CustomerOrderConfirmationPayload = {
      orderId: order.id,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      sevenElevenStore: order.customer.sevenElevenStore,
      transferLast5Digits: order.customer.transferLast5Digits,
      items: order.items.map((item) => {
        const unitPrice = getCartItemUnitPrice(item);
        return {
          productName: item.product.name,
          variantName: item.selectedVariant?.name,
          selectedOptions: item.selectedOptions,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      }),
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      totalAmount: order.totalAmount,
    };

    console.log('[NotificationService] Customer Order Confirmation queued:', payload);

    return Promise.resolve({
      success: true,
      message: `客戶訂單明細已建立 (寄送至: ${order.customer.email})`,
    });
  }
}

export const notificationService = new NotificationService();
