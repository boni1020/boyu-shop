export interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  category: string
}

export const products: Product[] = [
  {
    id: 1,
    name: '澳洲巧克力',
    price: 399,
    image: 'https://placehold.co/600x600',
    description: '來自澳洲的經典巧克力。',
    category: '零食',
  },
  {
    id: 2,
    name: '澳洲蜂蜜',
    price: 599,
    image: 'https://placehold.co/600x600',
    description: '澳洲天然蜂蜜。',
    category: '食品',
  },
  {
    id: 3,
    name: '澳洲保健品',
    price: 899,
    image: 'https://placehold.co/600x600',
    description: '澳洲熱門保健食品。',
    category: '保健品',
  },
]