import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { cart, cartTotal, loading, updateQuantity, removeFromCart } =
    useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <main className="container section">
        <h1>Your cart</h1>
        <p>Please log in to view your cart.</p>
        <Link to="/login" className="button button-primary">
          Login
        </Link>
      </main>
    );
  }

  if (loading) {
    return <p className="page-message">Loading cart...</p>;
  }

  if (cart.items.length === 0) {
    return (
      <main className="container section empty-state">
        <h1>Your cart is empty</h1>
        <p>Discover something you'll love.</p>
        <Link to="/products" className="button button-primary">
          Browse products
        </Link>
      </main>
    );
  }

  const shippingCost = cartTotal >= 100 ? 0 : 10;

  const handleUpdate = async (productId, quantity) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      alert(error.response?.data?.message || "Could not update quantity");
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      alert(error.response?.data?.message || "Could not remove product");
    }
  };

  return (
    <main className="container section">
      <div className="page-heading">
        <span className="eyebrow">YOUR SELECTION</span>
        <h1>Shopping cart</h1>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((item) => (
            <article className="cart-item" key={item.product._id}>
              <img src={item.product.thumbnail} alt={item.product.title} />

              <div className="cart-item-info">
                <Link to={`/products/${item.product._id}`}>
                  <h3>{item.product.title}</h3>
                </Link>

                <p>${item.product.price.toFixed(2)}</p>

                <label>
                  Quantity
                  <input
                    type="number"
                    min="1"
                    max={item.product.stock}
                    value={item.quantity}
                    onChange={(event) =>
                      handleUpdate(item.product._id, Number(event.target.value))
                    }
                  />
                </label>
              </div>

              <button
                className="text-button"
                onClick={() => handleRemove(item.product._id)}
              >
                Remove
              </button>
            </article>
          ))}
        </div>

        <aside className="summary-card">
          <h2>Order summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>${cartTotal.toFixed(2)}</strong>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <strong>
              {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
            </strong>
          </div>

          <div className="summary-row summary-total">
            <span>Total</span>
            <strong>${(cartTotal + shippingCost).toFixed(2)}</strong>
          </div>

          <button
            className="button button-primary button-full"
            onClick={() => navigate("/checkout")}
          >
            Proceed to checkout
          </button>

          <Link to="/products" className="continue-shopping">
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
};

export default Cart;
