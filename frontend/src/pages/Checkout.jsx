import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useCart } from "../context/CartContext";

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Algeria",
    phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const shippingCost = cartTotal >= 100 ? 0 : 10;
  const total = cartTotal + shippingCost;

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/orders", {
        shippingAddress: form,
        paymentSuccess: true,
      });

      await clearCart();

      navigate(`/orders?success=${response.data.order._id}`);
    } catch (error) {
      setError(
        error.response?.data?.message || "Could not complete your order.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <main className="container section">
        <h1>Your cart is empty</h1>
        <Link to="/products" className="button button-primary">
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="page-heading">
        <span className="eyebrow">ALMOST THERE</span>
        <h1>Checkout</h1>
        <p>Enter your delivery information to place your order.</p>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <h2>Shipping information</h2>

          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />

          <label htmlFor="address">Address</label>
          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />

          <div className="form-row">
            <div>
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="postalCode">Postal code</label>
              <input
                id="postalCode"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label htmlFor="country">Country</label>
          <input
            id="country"
            name="country"
            value={form.country}
            onChange={handleChange}
            required
          />

          <label htmlFor="phone">Phone number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <div className="payment-notice">
            <strong>Payment method: Simulated payment</strong>
            <p>
              This is a demonstration checkout. No real payment or card
              information is collected.
            </p>
          </div>

          <button
            className="button button-primary button-full"
            disabled={loading}
          >
            {loading ? "Placing order..." : "Place order"}
          </button>
        </form>

        <aside className="summary-card">
          <h2>Your order</h2>

          {cart.items.map((item) => (
            <div className="summary-row" key={item.product._id}>
              <span>
                {item.product.title} × {item.quantity}
              </span>

              <strong>
                ${(item.product.price * item.quantity).toFixed(2)}
              </strong>
            </div>
          ))}

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
            <strong>${total.toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;
