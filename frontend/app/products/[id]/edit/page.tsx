'use client';

import { useEffect, useState } from 'react';
import ProductForm from '../../../../components/ProductForm';
import { apiFetch } from '../../../../lib/api';
import { getStoredUser, getToken } from '../../../../lib/auth';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  sellerId: string;
};

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [productId, setProductId] = useState('');

  useEffect(() => {
    params.then(async ({ id }) => {
      setProductId(id);
      try {
        const data = await apiFetch<Product>(`/products/${id}`);
        const user = getStoredUser();
        if (!user || user.id !== data.sellerId) {
          setError('You can edit only your own product');
          return;
        }
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      }
    });
  }, [params]);

  async function handleUpdate(values: {
    name: string;
    description: string;
    price: string;
    image: string;
    quantity: string;
  }) {
    const token = getToken();
    if (!token) {
      throw new Error('Please login first');
    }

    await apiFetch(`/products/${productId}`, {
      method: 'PUT',
      token,
      body: {
        name: values.name,
        description: values.description,
        price: Number(values.price),
        image: values.image,
        quantity: Number(values.quantity),
      },
    });

    window.location.href = `/products/${productId}`;
  }

  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="alert">Loading...</div>;

  return (
    <div>
      <h1 className="pageTitle">Edit Product</h1>
      <ProductForm
        submitText="Update Product"
        onSubmit={handleUpdate}
        initialValues={{
          name: product.name,
          description: product.description,
          price: String(product.price),
          image: product.image,
          quantity: String(product.quantity),
        }}
      />
    </div>
  );
}
