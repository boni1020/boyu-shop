import { products } from "../data/products";
import ProductCard from "../components/ProductCard";

function ProductList() {
  return (
    <main className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </main>
  );
}

export default ProductList;
