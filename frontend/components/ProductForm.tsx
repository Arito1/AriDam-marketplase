'use client';

import { useState } from 'react';

type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  image: string;
  quantity: string;
};

export default function ProductForm({
  initialValues,
  onSubmit,
  submitText,
}: {
  initialValues: ProductFormValues;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  submitText: string;
}) {
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(values);
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <label className="label">
        Product Name
        <input
          className="input"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          required
        />
      </label>

      <label className="label">
        Description
        <textarea
          className="textarea"
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          required
        />
      </label>

      <label className="label">
        Price
        <input
          className="input"
          type="number"
          step="0.01"
          min="0"
          value={values.price}
          onChange={(e) => setValues({ ...values, price: e.target.value })}
          required
        />
      </label>

      <label className="label">
        Image URL
        <input
          className="input"
          value={values.image}
          onChange={(e) => setValues({ ...values, image: e.target.value })}
          required
        />
      </label>

      <label className="label">
        Quantity
        <input
          className="input"
          type="number"
          min="0"
          value={values.quantity}
          onChange={(e) => setValues({ ...values, quantity: e.target.value })}
          required
        />
      </label>

      <button className="button" disabled={loading}>
        {loading ? 'Saving...' : submitText}
      </button>
    </form>
  );
}
