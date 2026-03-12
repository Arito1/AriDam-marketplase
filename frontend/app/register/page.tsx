'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/api';
import { saveAuth } from '../../lib/auth';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const data = await apiFetch<{ token: string; user: { id: string; username: string } }>('/auth/register', {
        method: 'POST',
        body: { username, password },
      });

      saveAuth(data.token, data.user);
      setMessage('Registration successful! Redirecting...');
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  }

  return (
    <div>
      <h1 className="pageTitle">Register</h1>
      <form className="form" onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        {message && <div className="alert">{message}</div>}

        <label className="label">
          Username
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>

        <label className="label">
          Password
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        <button className="button">Register</button>
      </form>
    </div>
  );
}
