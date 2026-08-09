import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav>
      <Link to="/">波嶼</Link>

      <div>
        <Link to="/">全部商品</Link>
        <Link to="/category/零食">零食</Link>
        <Link to="/category/食品">食品</Link>
        <Link to="/category/保健品">保健品</Link>
      </div>
    </nav>
  )
}

export default Navbar