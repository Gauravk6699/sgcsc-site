import { useState } from "react";
import API from "../api/axiosInstance";

export default function CertificateVerification() {
  const [certNo, setCertNo] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setPreviewUrl(null);
    setLoading(true);
    try {
      const num = certNo.trim();
      // Try student certificate first
      try {
        const res = await API.get(`/public/certificate/${num}`);
        if (res.data.success && res.data.data) {
          setResult({ ...res.data.data, certType: "student" });
          return;
        }
      } catch {}
      // Try typing certificate
      try {
        const res = await API.get(`/public/typing-certificate/${num}`);
        if (res.data.success && res.data.data) {
          setResult({ ...res.data.data, certType: "typing" });
          return;
        }
      } catch {}
      setError("No certificate found with this number. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const buildStudentCertData = (cert) => ({
    studentNameCombined: cert.name || "",
    courseName: cert.courseName || "",
    grade: cert.grade || "",
    courseDuration: cert.courseDuration || "",
    coursePeriodFrom: cert.coursePeriodFrom || "",
    coursePeriodTo: cert.coursePeriodTo || "",
    certificateNumber: cert.certificateNumber || "",
    dateOfIssue: cert.issueDate || "",
    photo: cert.photo || "",
    centerName: cert.centerName || cert.atcName || "",
  });

  const buildTypingCertData = (cert) => ({
    studentName: cert.studentName || "",
    fatherHusbandName: cert.fatherHusbandName || "",
    motherName: cert.motherName || "",
    enrollmentNumber: cert.enrollmentNumber || "",
    computerTyping: cert.computerTyping || "",
    certificateNo: cert.certificateNo || "",
    dateOfIssue: cert.dateOfIssue || "",
    sessionFrom: cert.sessionFrom || "",
    sessionTo: cert.sessionTo || "",
    grade: cert.grade || "",
    studyCentre: cert.studyCentre || "",
    wordsPerMinute: cert.wordsPerMinute || "",
    photo: cert.photo || "",
  });

  const handleDownload = async () => {
    if (!result) return;
    if (result.certType === "typing") {
      if (!window.TypingCertificateGenerator) {
        alert("Typing certificate generator not loaded. Please refresh the page.");
        return;
      }
      setDownloading(true);
      try {
        await window.TypingCertificateGenerator.loadTemplate("/typing-certificate-template.jpeg");
        await window.TypingCertificateGenerator.download(buildTypingCertData(result));
      } catch (err) {
        console.error("Typing certificate download error:", err);
        alert("Failed to generate typing certificate PDF.");
      } finally {
        setDownloading(false);
      }
    } else {
      if (!window.CertificateGenerator) {
        alert("Certificate generator not loaded. Please refresh the page.");
        return;
      }
      setDownloading(true);
      try {
        await window.CertificateGenerator.loadTemplate("/student-certificate-template.jpeg");
        await window.CertificateGenerator.download(buildStudentCertData(result));
      } catch (err) {
        console.error("Certificate download error:", err);
        alert("Failed to generate certificate PDF.");
      } finally {
        setDownloading(false);
      }
    }
  };

  const handlePreview = async () => {
    if (!result) return;
    if (result.certType === "typing") {
      if (!window.TypingCertificateGenerator) return;
      try {
        await window.TypingCertificateGenerator.loadTemplate("/typing-certificate-template.jpeg");
        const url = await window.TypingCertificateGenerator.getDataURL(buildTypingCertData(result));
        setPreviewUrl(url);
      } catch (err) {
        console.error("Typing cert preview error:", err);
      }
    } else {
      if (!window.CertificateGenerator) return;
      try {
        await window.CertificateGenerator.loadTemplate("/student-certificate-template.jpeg");
        const url = await window.CertificateGenerator.preview(buildStudentCertData(result));
        setPreviewUrl(url);
      } catch (err) {
        console.error("Certificate preview error:", err);
      }
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-2">Certificate Verification</h2>
      <p className="text-center text-muted mb-4">
        Enter a certificate number to verify its authenticity and view details.
      </p>

      <form onSubmit={handleSubmit} className="card p-4 mx-auto" style={{ maxWidth: 500 }}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Certificate Number</label>
          <input
            className="form-control"
            placeholder="e.g. CERT-2024-001"
            value={certNo}
            onChange={(e) => setCertNo(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-success w-100" disabled={loading}>
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2"></span>Verifying...</>
          ) : (
            <><i className="bi bi-shield-check me-2"></i>Verify Certificate</>
          )}
        </button>
      </form>

      {error && (
        <div className="alert alert-danger mt-3 mx-auto d-flex align-items-center gap-2" style={{ maxWidth: 500 }}>
          <i className="bi bi-x-circle-fill"></i>
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 mx-auto" style={{ maxWidth: 800 }}>
          <div className="text-center mb-3">
            <i className="bi bi-patch-check-fill text-success" style={{ fontSize: "2.5rem" }}></i>
            <p className="mt-1 text-success fw-semibold fs-5">Certificate Verified</p>
          </div>
          <CertificateResult
            cert={result}
            previewUrl={result.certificateImage || previewUrl}
            downloading={downloading}
            onDownload={handleDownload}
            onPreview={handlePreview}
          />
        </div>
      )}
    </div>
  );
}

function CertificateResult({ cert, previewUrl, downloading, onDownload, onPreview }) {
  const [expanded, setExpanded] = useState(false);
  const isTyping = cert.certType === "typing";
  const certNo = isTyping ? cert.certificateNo : cert.certificateNumber;
  const title = isTyping
    ? cert.computerTyping || "Typing Certificate"
    : cert.courseName || "Student Certificate";
  const imageToShow = cert.certificateImage || previewUrl;

  const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "-");

  const handleExpand = () => {
    if (!expanded) onPreview();
    setExpanded((v) => !v);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <i className={`bi ${isTyping ? "bi-keyboard me-2 text-info" : "bi-award-fill me-2 text-warning"}`}></i>
          <strong>{title}</strong>
          <span className="ms-2 text-muted small">#{certNo}</span>
          <span className={`ms-2 badge ${isTyping ? "bg-info text-dark" : "bg-warning text-dark"}`}>
            {isTyping ? "Typing Certificate" : "Student Certificate"}
          </span>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={handleExpand}>
            <i className={`bi bi-${expanded ? "eye-slash" : "eye"} me-1`}></i>
            {expanded ? "Hide" : "View"}
          </button>
          <button className="btn btn-sm btn-primary" onClick={onDownload} disabled={downloading}>
            {downloading ? (
              <><span className="spinner-border spinner-border-sm me-1"></span>Generating...</>
            ) : (
              <><i className="bi bi-download me-1"></i>Download PDF</>
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="card-body p-2 text-center bg-light">
          {imageToShow ? (
            <img
              src={imageToShow}
              alt={`Certificate ${certNo}`}
              style={{ maxWidth: "100%", borderRadius: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
            />
          ) : (
            <div className="py-4 text-muted">
              <div className="spinner-border spinner-border-sm me-2"></div>
              Generating preview...
            </div>
          )}
        </div>
      )}

      <div className="card-body">
        {isTyping ? (
          <div className="row g-2">
            <div className="col-sm-6">
              <p className="mb-1"><strong>Name:</strong> {cert.studentName || "-"}</p>
              <p className="mb-1"><strong>Father/Husband:</strong> {cert.fatherHusbandName || "-"}</p>
              <p className="mb-1"><strong>Mother's Name:</strong> {cert.motherName || "-"}</p>
              <p className="mb-1"><strong>Enrollment No:</strong> {cert.enrollmentNumber || "-"}</p>
            </div>
            <div className="col-sm-6">
              <p className="mb-1"><strong>Computer Typing:</strong> {cert.computerTyping || "-"}</p>
              <p className="mb-1"><strong>Words/Min:</strong> {cert.wordsPerMinute || "-"}</p>
              <p className="mb-1">
                <strong>Grade:</strong>{" "}
                <span className="badge bg-success">{cert.grade || "-"}</span>
              </p>
              <p className="mb-1"><strong>Session:</strong> {cert.sessionFrom || "-"} – {cert.sessionTo || "-"}</p>
              <p className="mb-1"><strong>Issue Date:</strong> {fmt(cert.dateOfIssue)}</p>
              <p className="mb-1"><strong>Study Centre:</strong> {cert.studyCentre || "-"}</p>
            </div>
          </div>
        ) : (
          <div className="row g-2">
            <div className="col-sm-6">
              <p className="mb-1"><strong>Name:</strong> {cert.name || "-"}</p>
              <p className="mb-1"><strong>Father's Name:</strong> {cert.fatherName || "-"}</p>
              <p className="mb-1"><strong>Enrollment No:</strong> {cert.enrollmentNumber || "-"}</p>
            </div>
            <div className="col-sm-6">
              <p className="mb-1"><strong>Course:</strong> {cert.courseName || "-"}</p>
              <p className="mb-1">
                <strong>Grade:</strong>{" "}
                <span className="badge bg-success">{cert.grade || "-"}</span>
              </p>
              <p className="mb-1"><strong>Session:</strong> {cert.sessionFrom || "-"} – {cert.sessionTo || "-"}</p>
              <p className="mb-1"><strong>Issue Date:</strong> {fmt(cert.issueDate)}</p>
              <p className="mb-1"><strong>Center:</strong> {cert.centerName || cert.atcName || "-"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
