'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { getStoredUser, getToken } from '../../../lib/auth';

type Comment = {
  id: string;
  username: string;
  rating: number;
  text: string;
  createdAt: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  sellerId: string;
  sellerUsername: string;
  createdAt: string;
  averageRating: number;
  comments: Comment[];
};

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState('5');
  const [productId, setProductId] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  async function loadProduct(id: string) {
    try {
      const data = await apiFetch<Product>(`/products/${id}`);
      setProduct(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    }
  }

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUserId(user?.id || null);

    params.then(({ id }) => {
      setProductId(id);
      loadProduct(id);
    });
  }, [params]);

  async function handleBuy() {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      return;
    }

    try {
      const data = await apiFetch<{ message: string; product: Product }>(`/products/${productId}/buy`, {
        method: 'POST',
        token,
      });
      setMessage(data.message);
      setProduct(data.product);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Purchase failed');
    }
  }

  async function handleDelete() {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      return;
    }

    try {
      await apiFetch(`/products/${productId}`, {
        method: 'DELETE',
        token,
      });
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  }

  async function handleComment(event: React.FormEvent) {
    event.preventDefault();
    const token = getToken();
    if (!token) {
      setError('Please login first');
      return;
    }

    try {
      const updated = await apiFetch<Product>(`/products/${productId}/comments`, {
        method: 'POST',
        token,
        body: {
          text: commentText,
          rating: Number(rating),
        },
      });

      setProduct(updated);
      setCommentText('');
      setRating('5');
      setMessage('Comment added successfully');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
    }
  }

  if (error && !product) return <div className="error">{error}</div>;
  if (!product) return <div className="alert">Loading...</div>;

  const isOwner = currentUserId === product.sellerId;

  return (
    <div>
      <h1 className="pageTitle">{product.name}</h1>
      {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}
      {message && <div className="alert" style={{ marginBottom: 12 }}>{message}</div>}

      <div className="detailsGrid">
        <div className="card">
          <img src={product.image} alt={product.name} className="productImage" />
        </div>

        <div className="card">
          <p className="price">${product.price}</p>
          <p className="rating">Average Rating: ★ {product.averageRating}</p>
          <p className="muted">Seller: {product.sellerUsername}</p>
          <p className="muted">Available quantity: {product.quantity}</p>
          <p>{product.description}</p>
          <p className="small muted">Created: {new Date(product.createdAt).toLocaleString()}</p>

          <div className="row">
            <button className="button" disabled={product.quantity === 0} onClick={handleBuy}>
              {product.quantity === 0 ? 'Out of Stock' : 'Buy Now'}
            </button>

            {isOwner && (
              <>
                <Link className="button secondary" href={`/products/${product.id}/edit`}>
                  Edit
                </Link>
                <button className="button danger" onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <section style={{ marginTop: 28 }}>
        <h2>Leave a Comment and Rating</h2>
        <form className="form" onSubmit={handleComment}>
          <label className="label">
            Rating
            <select className="select" value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
          </label>

          <label className="label">
            Comment
            <textarea
              className="textarea"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
          </label>

          <button className="button">Submit Comment</button>
        </form>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Comments</h2>
        <div className="grid">
          {product.comments.length === 0 ? (
            <p className="muted">No comments yet.</p>
          ) : (
            product.comments
              .slice()
              .reverse()
              .map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="spaceBetween">
                    <strong>{comment.username}</strong>
                    <span className="rating">★ {comment.rating}</span>
                  </div>
                  <p>{comment.text}</p>
                  <p className="small muted">{new Date(comment.createdAt).toLocaleString()}</p>
                </div>
              ))
          )}
        </div>
      </section>
    </div>
  );
}
