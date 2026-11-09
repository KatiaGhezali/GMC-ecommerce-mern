import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import api from "../api/axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
  const successfulOrderId = searchParams.get("success");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/my-orders");
        setOrders(response.data.orders);
      } catch (error) {
        setError(error.response?.data?.message || "Could not load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p className="page-message">Loading orders...</p>;
  }

  return (
    <main className="container section">
      <div className="page-heading">
        <span className="eyebrow">YOUR ACCOUNT</span>
        <h1>My orders</h1>
      </div>

      {successfulOrderId && (
        <div className="alert alert-success">
          Your order was placed successfully!
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="button button-primary">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div className="order-header">
                <div>
                  <span className="muted-text">Order ID</span>
                  <h3>{order._id}</h3>
                </div>

                <span className={`status-badge status-${order.orderStatus}`}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="order-details">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>

                <p>
                  <strong>Payment:</strong> {order.paymentStatus}
                </p>

                <p>
                  <strong>Items:</strong> {order.items.length}
                </p>

                <p>
                  <strong>Total:</strong> ${order.total.toFixed(2)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default Orders;
