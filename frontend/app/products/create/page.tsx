'use client';

import ProductForm from '../../../components/ProductForm';
import { apiFetch } from '../../../lib/api';
import { getToken } from '../../../lib/auth';

export default function CreateProductPage() {
  async function handleCreate(values: {
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

    const product = await apiFetch('/products', {
      method: 'POST',
      token,
      body: {
        name: values.name,
        description: values.description,
        price: Number(values.price),
        image: values.image,
        quantity: Number(values.quantity),
      },
    });

    window.location.href = `/products/${(product as any).id}`;
  }

  return (
    <div>
      <h1 className="pageTitle">Create Product</h1>
      <ProductForm
        submitText="Create Product"
        onSubmit={handleCreate}
        initialValues={{
          name: '',
          description: '',
          price: '',
          image: '',
          quantity: '1',
        }}
      />
    </div>
  );
}
