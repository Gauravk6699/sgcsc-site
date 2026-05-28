import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'https://sgcsc-backend.onrender.com';

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Field({ label, value, full }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.06em', color: '#888', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.97rem', color: '#1a3a5c', fontWeight: 500 }}>
        {value || '—'}
      </div>
    </div>
  );
}

export default function CertificateVerify() {
  const { certNo } = useParams();
  const [status, setStatus] = useState('loading'); // loading | valid | invalid | error
  const [cert, setCert]     = useState(null);

  useEffect(() => {
    if (!certNo) { setStatus('error'); return; }

    async function verify() {
      try {
        const endpoints = [
          `${API_BASE}/api/certificates?search=${encodeURIComponent(certNo)}`,
          `${API_BASE}/api/typing-certificates?search=${encodeURIComponent(certNo)}`,
        ];

        let found = null;
        for (const url of endpoints) {
          const res  = await fetch(url, { credentials: 'include' });
          if (!res.ok) continue;
          const data = await res.json();
          const arr  = Array.isArray(data) ? data
                     : (data.data || data.certificates || data.results || []);
          if (arr.length > 0) { found = arr[0]; break; }
        }

        if (found) { setCert(found); setStatus('valid'); }
        else       { setStatus('invalid'); }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
      }
    }

    verify();
  }, [certNo]);

  return (
    <div style={{ background: '#f0f4f8', minHeight: '100vh', padding: '40px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.6rem', color: '#1a3a5c' }}>Certificate Verification</h1>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: 4 }}>
          Shree Ganpati Computer and Study Centre
        </p>
      </div>

      {/* Card */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                    maxWidth: 540, width: '100%', padding: '36px 32px' }}>

        {/* LOADING */}
        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 48, height: 48, border: '4px solid #e0e0e0',
              borderTopColor: '#1a73e8', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
            }} />
            <p style={{ color: '#666' }}>Verifying certificate...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* VALID */}
        {status === 'valid' && cert && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 8, background: '#e6f4ea',
              color: '#1e7e34', fontWeight: 600, fontSize: '1rem', marginBottom: 24
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Certificate Verified ✓
            </div>

            <div style={{
              display: 'inline-block', background: '#f0f4f8', color: '#555',
              fontSize: '0.8rem', padding: '4px 10px', borderRadius: 20,
              marginBottom: 20, fontFamily: 'monospace'
            }}>
              Cert No: {certNo}
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a3a5c',
                          marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #e8edf2' }}>
              {cert.studentName || cert.applicantName || cert.name || 'Student'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
              <Field label="Course"           value={cert.courseName} />
              <Field label="Grade"            value={cert.grade} />
              <Field label="Course Duration"  value={cert.courseDuration} />
              <Field label="Period From"      value={fmtDate(cert.coursePeriodFrom)} />
              <Field label="Period To"        value={fmtDate(cert.coursePeriodTo)} />
              <Field label="Date of Issue"    value={fmtDate(cert.dateOfIssue)} />
              <Field label="Institute"        value={cert.instituteName || cert.centerName} full />
              <Field label="Enrollment No."  value={cert.enrollmentNumber || cert.enrollmentNo} />
              <Field label="Certificate No." value={cert.certificateNumber || cert.certificateNo} />
            </div>
          </>
        )}

        {/* INVALID */}
        {status === 'invalid' && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 8, background: '#fce8e6',
              color: '#c0392b', fontWeight: 600, fontSize: '1rem', marginBottom: 24
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Certificate Not Found
            </div>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
              <h2 style={{ color: '#c0392b', marginBottom: 8 }}>No record found</h2>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                No certificate matching <strong>{certNo}</strong> was found.<br />
                Please check the certificate number or contact the institute.
              </p>
            </div>
          </>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
            <h2 style={{ color: '#c0392b', marginBottom: 8 }}>Verification Failed</h2>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Could not reach the server. Please try again later.
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 32, fontSize: '0.8rem', color: '#aaa', textAlign: 'center' }}>
        This verification is provided by SGCSC. Scan result is real-time.
      </div>
    </div>
  );
}