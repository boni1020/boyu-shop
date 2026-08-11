/** @format */

import { Link } from "react-router-dom";
import { categories } from "../data/categories";

function Navbar() {
  return (
    <nav className="">
      <div className="bg-primary h-14"></div>
      <div className="mx-auto flex max-w-screen-xl items-center px-25 py-7">
        <div className="flex flex-1 justify-start gap-3">
          {" "}
          {/* 左側預留空間 (Logo區塊) */}
          {/* <Link
          to="/"
          className="flex-1 mt-1 block text-2xl font-semibold text-gray-900 md:inline-block"
        >
          波嶼
        </Link> */}
        </div>

        {/* 中間導覽連結 */}
        <div className="flex min-w-0 items-center gap-3 overflow-x-auto text-h4 text-gray-500">
          <Link
            to="/"
            className="shrink-0 whitespace-nowrap font-medium text-text-main transition-colors hover:text-primary"
          >
            全部商品
          </Link>

          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/category/${category.slug}`}
              className="shrink-0 whitespace-nowrap font-medium transition-colors hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* 右側預留空間 (功能按鈕區塊) */}
        <div className="flex flex-1 justify-end gap-3">
          {/* 登入、購物車、搜尋按鈕放這裡 */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
