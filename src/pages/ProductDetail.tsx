/** @format */

import { Link, useParams } from "react-router-dom";
import { products } from "../data/products";

function ProductDetail() {
  const { id } = useParams();

  const product = products.find((product) => product.id === Number(id));

  if (!product) {
    return <p className="p-5 text-center text-gray-500">找不到商品</p>;
  }

  return (
    <main className="relative min-h-screen  font-sans pb-32">
      <header className="flex items-center justify-between p-5">
        <Link
          to="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      </header>

      <section className="flex items-center justify-center px-10 pt-4 pb-12">
        <img
          src={product.image}
          alt={product.name}
          className="h-64 w-auto object-contain"
        />
      </section>

      <section className="min-h-full  bg-white px-6 pt-8 ">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {product.name}
            </h2>
          </div>
          <div className="flex items-center gap-1 rounded-full  px-3 py-1">
            {/* <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="#f59e0b"
              stroke="#f59e0b"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg> */}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-gray-400">
            {product.description}{" "}
            {/* <span className="font-medium text-[#337a5b]">Read More..</span> */}
          </p>
        </div>
      </section>
    </main>
  );
}

export default ProductDetail;
