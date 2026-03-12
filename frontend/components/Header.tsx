'use client';

import Link from 'next/link';
import { clearAuth, getStoredUser } from '../lib/auth';
import { useEffect, useState } from 'react';

export default function Header() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    setUsername(user?.username || null);
  }, []);

  function handleLogout() {
    clearAuth();
    window.location.href = '/';
  }

  return (
    <header className="nav">
      <div className="navInner">
        <Link href="/" className="brand">AriDam</Link>

        <div className="navLinks">
          <Link href="/" className="navLink">Products</Link>
          <Link href="/products/create" className="navLink">Create Product</Link>
          <Link href="/history" className="navLink">Purchase History</Link>
          {!username ? (
            <>
              <Link href="/login" className="navLink">Login</Link>
              <Link href="/register" className="navLink">Register</Link>
            </>
          ) : (
            <>
              <span className="muted">Hi, {username}</span>
              <button className="button secondary" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}