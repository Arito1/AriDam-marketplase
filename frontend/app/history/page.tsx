'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { getToken } from '../../lib/auth';

type Purchase = {
  id: string;
  productName: string;
  price: number;
  purchaseDate: string;
};

export default function HistoryPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      const token = getToken();

      if (!token) {
        setError('Please login first');
        return;
      }

      try {
        const data = await apiFetch<Purchase[]>('/history', { token });
        setPurchases(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load purchase history');
      }
    }

    loadHistory();
  }, []);

  return (
    <div>
      <h1 className="pageTitle">Purchase History</h1>

      {error && <div className="error">{error}</div>}

      <div className="grid">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="card">
            <h3>{purchase.productName}</h3>
            <p className="price">${purchase.price}</p>
            <p className="muted">Purchased: {new Date(purchase.purchaseDate).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {!error && purchases.length === 0 && (
        <div className="alert">No purchases yet.</div>
      )}
    </div>
  );
}
