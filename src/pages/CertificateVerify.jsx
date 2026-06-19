import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'https://sgcsc-backend-dzp4.onrender.com';

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Field({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
                     letterSpacing: '0.06em', color: '#888', marginBottom: 3 }}>{label}</span>
      <span style={{ fontSize: '0.97rem', color: '#1a3a5c', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}

export default function CertificateVerify() {
  const { certNo } = useParams();
  const [status, setStatus] = useState('loading');
  const [cert, setCert] = useState(null);

  useEffect(() => {
    if (!certNo) { setStatus('error'); return; }

    async function fetchCertificate() {
      try {
        const res = await fetch(
          `${API_BASE}/api/public/certificate/${encodeURIComponent(certNo)}`
        );
        const data = await res.json();

        if (res.ok && data.success && data.data) {
          setCert(data.data);
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

  // Certificate found — show the stored image if there is one, otherwise the details
  if (status === 'valid' && cert) {
    if (cert.certificateImage) {
      return (
        <div style={{ minHeight: '100vh', background: '#f0f4f8', padding: '20px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={cert.certificateImage}
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

    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', padding: '40px 16px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                      maxWidth: 540, width: '100%', padding: '36px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                        borderRadius: 8, fontWeight: 600, background: '#e6f4ea', color: '#1e7e34',
                        marginBottom: 28 }}>
            Certificate Verified ✓
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a3a5c', marginBottom: 20,
                        paddingBottom: 12, borderBottom: '1px solid #e8edf2' }}>
            {cert.name || cert.studentName || 'Student'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
            <Field label="Course" value={cert.courseName} />
            <Field label="Grade" value={cert.grade} />
            <Field label="Course Duration" value={cert.courseDuration} />
            <Field label="Period From" value={fmtDate(cert.coursePeriodFrom)} />
            <Field label="Period To" value={fmtDate(cert.coursePeriodTo)} />
            <Field label="Date of Issue" value={fmtDate(cert.issueDate)} />
            <Field label="Institute" value={cert.centerName || cert.atcName} />
            <Field label="Enrollment No." value={cert.enrollmentNumber} />
            <Field label="Certificate No." value={cert.certificateNumber || certNo} />
          </div>
        </div>
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
