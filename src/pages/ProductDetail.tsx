import { Link, useParams } from 'react-router-dom'
import { products } from '../data/products'

function ProductDetail() {
  const { id } = useParams()

  const product = products.find(
    (product) => product.id === Number(id),
  )

  if (!product) {
    return <p>找不到商品</p>
  }

  return (
    <main>
      <img
        src={product.image}
        alt={product.name}
      />

      <h1>{product.name}</h1>

      <p>${product.price}</p>

      <p>{product.description}</p>

      <Link to="/">回首頁</Link>
    </main>
  )
}

export default ProductDetail