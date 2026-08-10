/** @format */

import { Link } from "react-router-dom";
import { categories } from "../data/categories";

function Navbar() {
  return (
    <nav>
      <Link to="/">波嶼</Link>

      <div>
        <Link to="/">全部商品</Link>

        {categories.map((category) => (
          <Link key={category.slug} to={`/category/${category.slug}`}>
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
