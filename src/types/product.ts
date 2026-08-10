import type { Category } from '../data/categories'

export interface Product {
    id: number
    name: string // 商品名
    description: string // 商品說明
    image: string // 商品圖
    brand: string  // 品牌
    weight: number // 重量
    expiryDate: string | null // 有效日期
    category: Category | ''// 商品類別
    price: number // 售價
}