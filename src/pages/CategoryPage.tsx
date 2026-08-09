import { useParams } from 'react-router-dom'
import { products } from '../data/products'
import ProductCard from '../components/ProductCard'

function CategoryPage() {
  const { category } = useParams()

  const filteredProducts = products.filter(
    (product) => product.category === category,
  )

  return (
    <main className="product-grid">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </main>
  )
}

export default CategoryPage