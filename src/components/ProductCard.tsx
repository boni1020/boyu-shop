import { Link } from 'react-router-dom'
import type { Product } from '../data/products'

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <img src={product.image} alt={product.name} />
      <p>${product.price}</p>
    </Link>
  )
}

export default ProductCard