import rawData from './products.json'
import type { Product } from '../types/product'
import { productCategories } from './productCategories'


const EXCHANGE_RATE = 24
const SHIPPING_PER_KG = 8
const SERVICE_FEE = 200

const calculatePrice = (money: number, weight: number) => {
  const price =
    money * EXCHANGE_RATE +
    weight * SHIPPING_PER_KG * EXCHANGE_RATE +
    SERVICE_FEE

  return Math.round(price / 10) * 10
}

export const products: Product[] = rawData.dataList.map((item) => ({
  id: item.A1,
  name: item.A6,
  description: '',
  image: item.A11,
  brand: item.ProductBrand,
  weight: item.A10,
  expiryDate: item.A9,
  category: productCategories[item.A1] ?? '',
  price: calculatePrice(item.Money, item.A10),
}))