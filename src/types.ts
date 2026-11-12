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

/**
 * 規格 variants 欄位格式 (src/data/products.json -> variants)
 * 絕不包含成本、重量、利潤或計算公式
 */
export interface JsonProductVariant {
  id: string;
  name: string;
  price: number;
  clearance_price: number | null;
  is_sale: boolean;
  image: string | null;
  weight?: number | null;
  expiry_date?: string | null;
}

/**
 * 商品欄位格式 (src/data/products.json)
 * weight 單位為 kg (number)
 */
export interface JsonProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string | null;
  image: string | null;
  price: number;
  clearance_price: number | null;
  is_sale: boolean;
  is_new: boolean;
  weight?: number | null;
  expiry_date?: string | null;
  variants: JsonProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  clearance_price: number | null;
  is_sale: boolean;
  is_new: boolean;
  image?: string | null;
  weight?: number | null;
  option_values?: Record<string, any> | null;
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
  origin?: string;
  tags: string[];
  inStock: boolean;
  isActive?: boolean;
  isNewArrival?: boolean;
  isClearance?: boolean;
  createdAt?: string;
  variants?: ProductVariant[];
  options?: ProductOption[];
  volumeOrSize?: string;
  weight?: number | null;
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

export interface BrandStats {
  name: string;
  count: number;
}
