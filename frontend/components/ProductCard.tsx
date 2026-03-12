import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  averageRating: number;
  quantity: number;
  sellerUsername: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="card">
      <img src={product.image} alt={product.name} className="productImage" />
      <div className="spaceBetween">
        <h3>{product.name}</h3>
        <span className="rating">★ {product.averageRating}</span>
      </div>
      <p className="muted small">Seller: {product.sellerUsername}</p>
      <p className="price">${product.price}</p>
      <p className="muted small">Available: {product.quantity}</p>
      <Link href={`/products/${product.id}`} className="button">View Details</Link>
    </div>
  );
}
