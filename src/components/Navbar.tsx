import { Link } from "react-router-dom";
import { categories } from "../data/categories";

function Navbar() {
  return (
    <nav className="bg-white px-5 pt-8 pb-6 font-sans">
      <div className="mx-auto max-w-screen-xl md:text-center">
        {/* <p className="text-sm text-gray-400">Good Morning,</p>
        <Link to="/" className="mt-1 block text-2xl font-semibold text-gray-900 md:inline-block">
          波嶼 
        </Link> */}

        <div className="mt-6 flex gap-3 overflow-x-auto md:justify-center">
          <Link
            to="/"
            className="shrink-0 whitespace-nowrap rounded-full bg-[#337a5b] px-5 py-2 text-sm font-medium text-white"
          >
            全部商品
          </Link>

          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/category/${category.slug}`}
              className="shrink-0 whitespace-nowrap rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-500"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;