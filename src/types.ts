export type CategoryId =
  | 'new-arrivals'
  | 'life'
  | 'beauty'
  | 'accessories'
  | 'essentials'
  | 'food-pantry'
  | 'clearance'
  | (string & {});

export type CategoryType = 'new' | 'regular' | 'sale';

export interface Category {
  id: string;
  name: string; // The exact Chinese name
  slug?: string;
  type?: CategoryType;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
  englishName?: string;
  story?: string;
  heroImage?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  img?: string | null;
  logo_url?: string | null;
  is_active?: boolean;
  story?: string;
  origin?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  weight: number | null;
  price: number;
  clearance_price: number | null;
  is_new: boolean;
  is_sale: boolean;
  option_values: Record<string, any> | null;
  image?: string | null;
  expiry_date?: string | null;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  brandId?: string;
  categoryId: CategoryId;
  categoryName: string;
  categorySlug?: string;
  price: number;
  clearancePrice?: number;
  imageUrl: string;
  hoverImageUrl?: string;
  description: string;
  shortDescription: string;
  origin: string; // e.g. "Byron Bay, NSW", "Melbourne, VIC", "Margaret River, WA"
  tags: string[];
  inStock: boolean;
  isActive?: boolean;
  isNewArrival?: boolean;
  isClearance?: boolean;
  createdAt?: string;
  variants?: ProductVariant[];
  options?: ProductOption[];
  volumeOrSize?: string;
  weight?: string;
  shelfLife?: string;
  expiryDate?: string;
  specifications?: string;
  features?: string[];
  ingredientsOrMaterials?: string[];
  rating?: number;
  reviewCount?: number;
  rawSupabaseData?: any;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  selectedOptions?: Record<string, string>;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  sevenElevenStore: string;
  transferLast5Digits: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  status: 'pending_transfer' | 'confirmed' | 'shipped';
}

export interface BankConfig {
  bankName: string;
  bankCode: string;
  branchName: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
}

export interface BrandStats {
  name: string;
  count: number;
}
