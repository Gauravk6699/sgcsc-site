// src/pages/FranchiseTypingCertificateList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-IN");
}

// Typing Certificate View Modal for printing/downloading
function TypingCertificateViewModal({ show, onClose, certificate }) {
  if (!show || !certificate) return null;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (certificate.certificateImage) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Typing Certificate - ${certificate.certificateNo}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { margin: 0; padding: 0; }
              img { max-width: 100%; height: auto; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <img src="${certificate.certificateImage}" />
            <script>
              window.onload = function() { window.print(); };
            </script>
          </body>
        </html>
      `);
    } else {
      printWindow.document.write(`
        <html>
          <head>
            <title>Typing Certificate - ${certificate.certificateNo}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Times New Roman', serif; padding: 20px; }
              .certificate { border: 5px double #123a5e; padding: 40px; max-width: 800px; margin: 0 auto; text-align: center; background: #fff; }
              .certificate h1 { font-size: 32px; color: #123a5e; margin-bottom: 10px; text-transform: uppercase; }
              .certificate .content { font-size: 16px; line-height: 2; color: #2d3748; }
              .certificate .name { font-size: 28px; font-weight: bold; color: #123a5e; margin: 20px 0; text-decoration: underline; }
              .certificate .details { margin: 30px 0; }
              .certificate .details table { width: 100%; border-collapse: collapse; }
              .certificate .details td { padding: 8px; text-align: left; }
              .certificate .details td:first-child { font-weight: bold; width: 40%; }
              @media print { body { padding: 0; } .certificate { border: none; } }
            </style>
          </head>
          <body>
            <div class="certificate">
              <h1>Typing Certificate</h1>
              <div class="content">This is to certify that</div>
              <div class="name">${certificate.studentName}</div>
              <div class="content">has successfully completed computer typing training with the following details:</div>
              <div class="details">
                <table>
                  <tbody>
                    <tr><td>Father/Husband Name:</td><td>${certificate.fatherHusbandName}</td></tr>
                    <tr><td>Mother Name:</td><td>${certificate.motherName}</td></tr>
                    <tr><td>Enrollment Number:</td><td>${certificate.enrollmentNumber}</td></tr>
                    <tr><td>Computer Typing:</td><td>${certificate.computerTyping}</td></tr>
                    <tr><td>Certificate Number:</td><td>${certificate.certificateNo}</td></tr>
                    <tr><td>Date of Issue:</td><td>${fmtDate(certificate.dateOfIssue)}</td></tr>
                    <tr><td>Session From:</td><td>${certificate.sessionFrom}</td></tr>
                    <tr><td>Session To:</td><td>${certificate.sessionTo}</td></tr>
                    <tr><td>Grade:</td><td>${certificate.grade}</td></tr>
                    <tr><td>Study Centre:</td><td>${certificate.studyCentre}</td></tr>
                    <tr><td>Words Per Minute:</td><td>${certificate.wordsPerMinute}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); };
            </script>
          </body>
        </html>
      `);
    }
    printWindow.document.close();
  };

  const downloadAsPDF = async () => {
    try {
      const { jsPDF } = window.jspdf;
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = certificate.certificateImage;
      });
      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
        unit: "px",
        format: [img.width, img.height],
      });
      pdf.addImage(certificate.certificateImage, "JPEG", 0, 0, img.width, img.height);
      pdf.save(`typing_certificate_${certificate.certificateNo}.pdf`);
    } catch (err) {
      console.error("Error creating PDF:", err);
      alert("Failed to create PDF");
    }
  };

  const handleDownload = () => {
    if (!certificate.certificateImage) {
      alert("No certificate image available to download");
      return;
    }
    if (!window.jspdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => downloadAsPDF();
      document.body.appendChild(script);
    } else {
      downloadAsPDF();
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog modal-xl" role="document" style={{ maxWidth: "90%" }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">View Typing Certificate - {certificate.certificateNo}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="text-center mb-3">
              <button className="btn btn-primary me-2" onClick={handlePrint}>
                Print Certificate
              </button>
              {certificate.certificateImage && (
                <button className="btn btn-success" onClick={handleDownload}>
                  Download Certificate
                </button>
              )}
            </div>
            {certificate.certificateImage ? (
              <div className="text-center">
                <img
                  src={certificate.certificateImage}
                  alt="Typing Certificate"
                  style={{ maxWidth: "100%", height: "auto", border: "1px solid #ccc" }}
                />
              </div>
            ) : (
              <div className="p-4 border">
                <div className="text-center">
                  <h5 className="text-uppercase fw-bold">Typing Certificate</h5>
                  <p className="text-muted">This is to certify that</p>
                  <h4 className="fw-bold text-primary mb-3">{certificate.studentName}</h4>
                  <p className="mb-2">has successfully completed computer typing training</p>
                </div>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <p><strong>Father/Husband Name:</strong> {certificate.fatherHusbandName}</p>
                    <p><strong>Mother Name:</strong> {certificate.motherName}</p>
                    <p><strong>Enrollment No:</strong> {certificate.enrollmentNumber}</p>
                    <p><strong>Session From:</strong> {certificate.sessionFrom}</p>
                    <p><strong>Session To:</strong> {certificate.sessionTo}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Computer Typing:</strong> {certificate.computerTyping}</p>
                    <p><strong>Certificate No:</strong> {certificate.certificateNo}</p>
                    <p><strong>Date of Issue:</strong> {fmtDate(certificate.dateOfIssue)}</p>
                    <p><strong>Grade:</strong> {certificate.grade}</p>
                    <p><strong>Study Centre:</strong> {certificate.studyCentre}</p>
                    <p><strong>Words Per Minute:</strong> {certificate.wordsPerMinute}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FranchiseTypingCertificateList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(location.state?.message || "");
  const [search, setSearch] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingCert, setViewingCert] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await API.get("/franchise/typing-certificates");
      const arr = Array.isArray(res.data) ? res.data : [];
      setCerts(arr);
    } catch (err) {
      console.error("fetch typing certificates", err);
      setMsg(err.response?.data?.message || err.userMessage || "Failed to load typing certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredCerts = useMemo(() => {
    if (!search.trim()) return certs;
    const s = search.trim().toLowerCase();
    return certs.filter(
      (c) =>
        (c.studentName || "").toLowerCase().includes(s) ||
        (c.enrollmentNumber || "").toLowerCase().includes(s) ||
        (c.certificateNo || "").toLowerCase().includes(s)
    );
  }, [certs, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this typing certificate?")) return;
    try {
      await API.delete(`/franchise/typing-certificates/${id}`);
      setCerts((prev) => prev.filter((c) => (c._id || c.id) !== id));
      setMsg("Typing certificate deleted.");
    } catch (err) {
      console.error("delete typing certificate error:", err);
      setMsg(err.response?.data?.message || "Failed to delete typing certificate");
    }
  };

  const handleView = (cert) => {
    setViewingCert(cert);
    setShowViewModal(true);
  };

  return (
    <FranchiseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Typing Certificates</h2>
          <small className="text-muted">View, search, edit and delete typing certificates</small>
        </div>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 260 }}
            placeholder="Search typing certificates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-outline-secondary" onClick={loadAll} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/franchise/typing-certificates/create")}
          >
            Create Certificate
          </button>
        </div>
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center text-muted">Loading typing certificates…</div>
          ) : filteredCerts.length === 0 ? (
            <div className="p-4 text-center text-muted">No typing certificates found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-primary">
                  <tr>
                    <th>Student Name</th>
                    <th>Father/Husband Name</th>
                    <th>Enrollment No</th>
                    <th>Certificate No</th>
                    <th>Computer Typing</th>
                    <th>Session From</th>
                    <th>Grade</th>
                    <th>Date of Issue</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCerts.map((c) => (
                    <tr key={c._id || c.id}>
                      <td>{c.studentName}</td>
                      <td>{c.fatherHusbandName}</td>
                      <td>{c.enrollmentNumber}</td>
                      <td>{c.certificateNo}</td>
                      <td>{c.computerTyping}</td>
                      <td>{c.sessionFrom}</td>
                      <td>{c.grade}</td>
                      <td>{fmtDate(c.dateOfIssue)}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-success me-2"
                          onClick={() => handleView(c)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning me-2"
                          onClick={() =>
                            navigate(`/franchise/typing-certificates/create?id=${c._id || c.id}`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(c._id || c.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <TypingCertificateViewModal
        show={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingCert(null);
        }}
        certificate={viewingCert}
      />

      {/* Hidden canvas for typing certificate rendering */}
      <canvas id="typingCertCanvas" style={{ display: "none" }}></canvas>
    </FranchiseLayout>
  );
}
