import { Link } from "react-router-dom";

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`}>
        <div className="product-image">
          <img src={product.thumbnail} alt={product.title} loading="lazy" />

          {product.discountPercentage > 0 && (
            <span className="discount-badge">
              -{Math.round(product.discountPercentage)}%
            </span>
          )}
        </div>
      </Link>

      <div className="product-info">
        <span className="product-category">{product.category}</span>

        <Link to={`/products/${product._id}`}>
          <h3>{product.title}</h3>
        </Link>

        <div className="product-rating">
          ★ {Number(product.rating).toFixed(1)}
        </div>

        <div className="product-card-bottom">
          <strong>${product.price.toFixed(2)}</strong>

          <button
            className="button button-primary button-small"
            onClick={() => onAddToCart(product._id)}
            disabled={product.stock < 1}
          >
            {product.stock > 0 ? "Add to cart" : "Out of stock"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
