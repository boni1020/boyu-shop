import { products } from "../data/products";
import ProductCard from "../components/ProductCard";

function ProductList() {
  return (
    <main className="mx-auto grid max-w-screen-xl grid-cols-2 gap-4 px-5 pb-8 md:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </main>
  );
}

export default ProductList;