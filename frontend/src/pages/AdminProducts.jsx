import { useEffect, useState } from "react";

import api from "../api/axios";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  category: "",
  thumbnail: "",
  stock: "",
  brand: "",
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const response = await api.get("/products?limit=100");
      setProducts(response.data.products);
    } catch (error) {
      setError(error.response?.data?.message || "Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleEdit = (product) => {
    setEditingId(product._id);

    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      thumbnail: product.thumbnail,
      stock: product.stock,
      brand: product.brand || "",
    });

    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage("Product updated successfully.");
      } else {
        await api.post("/products", payload);
        setMessage("Product created successfully.");
      }

      resetForm();
      await fetchProducts();
    } catch (error) {
      setError(error.response?.data?.message || "Could not save product");
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/products/${productId}`);
      setMessage("Product deleted successfully.");
      await fetchProducts();
    } catch (error) {
      setError(error.response?.data?.message || "Could not delete product");
    }
  };

  return (
    <main className="container section">
      <div className="page-heading">
        <span className="eyebrow">STORE MANAGEMENT</span>
        <h1>Manage products</h1>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit product" : "Add a product"}</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <label htmlFor="title">Product name</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="3"
          required
        />

        <div className="form-row">
          <div>
            <label htmlFor="price">Price</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <label htmlFor="category">Category</label>
        <input
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        />

        <label htmlFor="brand">Brand</label>
        <input
          id="brand"
          name="brand"
          value={form.brand}
          onChange={handleChange}
        />

        <label htmlFor="thumbnail">Image URL</label>
        <input
          id="thumbnail"
          name="thumbnail"
          type="url"
          value={form.thumbnail}
          onChange={handleChange}
          required
        />

        <div className="form-actions">
          <button className="button button-primary">
            {editingId ? "Save changes" : "Create product"}
          </button>

          {editingId && (
            <button
              type="button"
              className="button button-outline"
              onClick={resetForm}
            >
              Cancel editing
            </button>
          )}
        </div>
      </form>

      <section className="admin-products">
        <h2>Product inventory</h2>

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.title}</td>
                    <td>{product.category}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="text-button"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>

                        <button
                          className="text-button text-danger"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminProducts;
