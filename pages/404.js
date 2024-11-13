// pages/404.js

import Link from 'next/link';

export default function Custom404() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#333' }}>404 - Page Not Found</h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>Oops! The page you are looking for does not exist.</p>
      <Link href="/" passHref>
        <a style={{ marginTop: '20px', fontSize: '1.1rem', color: '#0070f3', textDecoration: 'underline' }}>Go back to Home</a>
      </Link>
    </div>
  );
}
