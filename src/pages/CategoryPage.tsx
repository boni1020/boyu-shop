/** @format */

import { useParams } from "react-router-dom";
import { products } from "../data/products";
import { categories } from "../data/categories";
import ProductCard from "../components/ProductCard";

function CategoryPage() {
  const { category: slug } = useParams();

  const category = categories.find((category) => category.slug === slug);

  const categoryProducts = products.filter(
    (product) => product.category === category?.name,
  );

  return (
    <main>
      <h1>{category?.name}</h1>

      <div className="mx-auto grid max-w-screen-xl grid-cols-2 gap-4 px-5 pb-8 md:grid-cols-5">
        {categoryProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}

export default CategoryPage;
