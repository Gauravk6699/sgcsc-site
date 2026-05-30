import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'https://sgcsc-backend-dzp4.onrender.com';

export default function CertificateVerify() {
  const { certNo } = useParams();
  const [status, setStatus] = useState('loading');
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!certNo) { setStatus('error'); return; }

    async function fetchCertificate() {
      try {
        const res = await fetch(
          `${API_BASE}/api/public/certificate/${encodeURIComponent(certNo)}`
        );
        const data = await res.json();

        if (res.ok && data.success && data.data && data.data.certificateImage) {
          setImageUrl(data.data.certificateImage);
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch (err) {
        console.error('Error fetching certificate:', err);
        setStatus('error');
      }
    }

    fetchCertificate();
  }, [certNo]);

  // Loading
  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', background: '#f0f4f8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '4px solid #e0e0e0',
            borderTopColor: '#1a73e8', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ color: '#666' }}>Loading certificate...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Certificate found — show the image directly
  if (status === 'valid' && imageUrl) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', padding: '20px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img
          src={imageUrl}
          alt={`Certificate ${certNo}`}
          style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain',
                   borderRadius: 8, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
        />
        <p style={{ marginTop: 12, fontSize: '0.8rem', color: '#aaa', textAlign: 'center' }}>
          Certificate No: {certNo} — Verified by SGCSC
        </p>
      </div>
    );
  }

  // Not found
  if (status === 'invalid') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', background: '#f0f4f8' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '40px 32px',
                      textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', maxWidth: 400 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
          <h2 style={{ color: '#c0392b', marginBottom: 8 }}>Certificate Not Found</h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            No certificate matching <strong>{certNo}</strong> was found.<br />
            Please check the certificate number or contact the institute.
          </p>
        </div>
      </div>
    );
  }

  // Error
  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center',
                  alignItems: 'center', background: '#f0f4f8' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '40px 32px',
                    textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', maxWidth: 400 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
        <h2 style={{ color: '#c0392b', marginBottom: 8 }}>Verification Failed</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Could not reach the server. Please try again later.
        </p>
      </div>
    </div>
  );
}
