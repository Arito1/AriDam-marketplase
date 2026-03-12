import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../lib/api';

async function getProducts() {
  const response = await fetch(`${API_URL}/products`, { cache: 'no-store' });
  if (!response.ok) return [];
  return response.json();
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div>
      <section className="hero">
        <div className="heroPanel">
          <h1 className="pageTitle">AriDam Marketplace</h1>
          <p className="subtitle">
            Discover products, add your own listings, buy safely, and leave ratings in one clean marketplace.
          </p>
          <div className="heroActions">
            <Link href="/products/create" className="button">Start Selling</Link>
          </div>
        </div>

        <div className="heroStat">
          <div>
            <div className="heroStatValue">{products.length}</div>
            <div className="heroStatLabel">products already listed</div>
          </div>
        </div>
      </section>

      <h2 className="sectionTitle">Latest Products</h2>
      <div className="grid">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}