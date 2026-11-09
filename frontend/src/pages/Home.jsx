import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products?limit=8");
        setProducts(response.data.products);
      } catch (error) {
        console.error("Could not load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await addToCart(productId);
      alert("Product added to cart!");
    } catch (error) {
      alert(error.response?.data?.message || "Could not add product to cart");
    }
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div>
            <span className="eyebrow">WELCOME TO NOVASTORE</span>

            <h1>
              Find what you need.
              <br />
              Love what you buy.
            </h1>

            <p>
              Discover our collection of electronics and everyday essentials at
              great prices.
            </p>

            <Link to="/products" className="button button-primary">
              Explore products
            </Link>
          </div>

          <div className="hero-decoration">
            <div className="hero-circle">N</div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OUR COLLECTION</span>
            <h2>Featured products</h2>
          </div>

          <Link to="/products" className="text-link">
            View all products →
          </Link>
        </div>

        {loading ? (
          <p className="page-message">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="page-message">No products available.</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      <section className="benefits-section">
        <div className="container benefits-grid">
          <div>
            <h3>Quality products</h3>
            <p>Carefully selected products for everyday life.</p>
          </div>

          <div>
            <h3>Easy shopping</h3>
            <p>A simple and convenient shopping experience.</p>
          </div>

          <div>
            <h3>Secure checkout</h3>
            <p>Your orders are managed through your account.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
