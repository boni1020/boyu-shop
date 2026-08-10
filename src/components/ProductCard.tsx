/** @format */

import { Link } from "react-router-dom";
import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <img src={product.image} alt={product.name} />

      <p>{product.name}</p>

      <p>${product.price}</p>
    </Link>
  );
}

export default ProductCard;
