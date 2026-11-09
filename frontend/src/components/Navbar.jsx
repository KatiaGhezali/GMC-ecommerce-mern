import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="logo">
          Nova<span>Store</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Shop</NavLink>

          {user && (
            <>
              <NavLink to="/orders">My Orders</NavLink>

              {isAdmin && <NavLink to="/admin/products">Admin</NavLink>}
            </>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/cart" className="cart-link">
                Cart <span className="cart-badge">{cartCount}</span>
              </Link>

              <span className="user-name">Hi, {user.name.split(" ")[0]}</span>

              <button
                className="button button-outline button-small"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link
                to="/register"
                className="button button-primary button-small"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
