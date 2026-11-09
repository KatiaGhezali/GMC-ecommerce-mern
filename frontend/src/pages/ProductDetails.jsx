import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await addToCart(product._id, quantity);
      alert("Product added to cart!");
    } catch (error) {
      alert(error.response?.data?.message || "Could not add product");
    }
  };

  if (loading) {
    return <p className="page-message">Loading product...</p>;
  }

  if (!product) {
    return (
      <main className="container section">
        <h1>Product not found</h1>
        <Link to="/products" className="text-link">
          Return to products
        </Link>
      </main>
    );
  }

  return (
    <main className="container section">
      <Link to="/products" className="text-link">
        ← Back to products
      </Link>

      <div className="product-details">
        <div className="details-image">
          <img src={product.thumbnail} alt={product.title} />
        </div>

        <div className="details-content">
          <span className="eyebrow">{product.category}</span>

          <h1>{product.title}</h1>

          <div className="product-rating">
            ★ {Number(product.rating).toFixed(1)}
          </div>

          <p>{product.description}</p>

          {product.brand && (
            <p>
              <strong>Brand:</strong> {product.brand}
            </p>
          )}

          <h2>${product.price.toFixed(2)}</h2>

          <p>
            {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
          </p>

          <div className="quantity-control">
            <label htmlFor="quantity">Quantity</label>

            <input
              id="quantity"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  Math.max(
                    1,
                    Math.min(
                      Number(event.target.value) || 1,
                      product.stock || 1,
                    ),
                  ),
                )
              }
            />
          </div>

          <button
            className="button button-primary"
            onClick={handleAddToCart}
            disabled={product.stock < 1}
          >
            Add to cart
          </button>
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;
