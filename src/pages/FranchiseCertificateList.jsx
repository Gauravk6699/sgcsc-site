// src/pages/FranchiseCertificateList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-IN");
}

export default function FranchiseCertificateList() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(null); // _id of cert being downloaded

  const fetchCertificates = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await API.get("/franchise/certificates");
      const arr = Array.isArray(res.data) ? res.data : [];
      setCertificates(arr);
    } catch (err) {
      console.error("fetch certificates", err);
      setMsgType("danger");
      setMsg(err.response?.data?.message || err.userMessage || "Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this certificate?")) return;
    setMsg("");
    try {
      await API.delete(`/franchise/certificates/${id}`);
      setCertificates((prev) => prev.filter((c) => c._id !== id));
      setMsgType("success");
      setMsg("Certificate deleted.");
    } catch (err) {
      console.error("delete certificate", err);
      setMsgType("danger");
      setMsg(err.response?.data?.message || "Failed to delete certificate");
    }
  };

  // Download PDF using the shared CertificateGenerator (same template as admin)
  // After rendering, save the image to the backend so /verify/:certNo works via QR scan.
  const handleDownload = async (cert) => {
    if (!window.CertificateGenerator) {
      setMsgType("danger");
      setMsg("Certificate generator not loaded. Please refresh the page and try again.");
      return;
    }

    setDownloading(cert._id);
    setMsg("");
    try {
      // Build the data object the generator expects
      const certData = {
        ...cert,
        // studentNameCombined is what the template renders in the "name" field
        studentNameCombined: cert.name || "",
        // centerName is already on the cert record (set from franchise.instituteName at creation)
        centerName: cert.centerName || cert.atcName || "",
        dateOfIssue: cert.issueDate || cert.dateOfIssue || "",
        photo: cert.photo || "",
        courseDuration: cert.courseDuration || "",
        coursePeriodFrom: cert.coursePeriodFrom || cert.sessionFrom || "",
        coursePeriodTo: cert.coursePeriodTo || cert.sessionTo || "",
      };

      // Load template if not already loaded
      if (window.CertificateGenerator.config?.templatePath) {
        await window.CertificateGenerator.loadTemplate(
          window.CertificateGenerator.config.templatePath
        );
      }

      // Trigger PDF download
      await window.CertificateGenerator.download(certData);

      // Save a compressed image of the certificate so the QR code is verifiable
      try {
        const imageDataURL = await window.CertificateGenerator.getCompressedDataURL(certData);
        await API.patch(`/franchise/certificates/${cert._id}/image`, {
          certificateImage: imageDataURL,
        });
        // Update local state so the QR badge shows
        setCertificates((prev) =>
          prev.map((c) =>
            c._id === cert._id ? { ...c, certificateImage: imageDataURL } : c
          )
        );
      } catch (imgErr) {
        console.warn("Could not save certificate image for QR verification:", imgErr);
        // Download still succeeded — non-fatal
      }
    } catch (err) {
      console.error("Download error:", err);
      setMsgType("danger");
      setMsg("Failed to generate certificate PDF. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  const filteredCertificates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return certificates;
    return certificates.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const enrollment = (c.enrollmentNumber || "").toLowerCase();
      const certNumber = (c.certificateNumber || "").toLowerCase();
      const course = (c.courseName || "").toLowerCase();
      return name.includes(q) || enrollment.includes(q) || certNumber.includes(q) || course.includes(q);
    });
  }, [certificates, search]);

  return (
    <FranchiseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Certificates</h2>
          <small className="text-muted">
            Manage and download certificates for your students
          </small>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search by name / enrollment / certificate no"
            style={{ minWidth: 220 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={fetchCertificates}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/franchise/certificates/create")}
          >
            Add Certificate
          </button>
        </div>
      </div>

      {msg && <div className={`alert alert-${msgType}`}>{msg}</div>}

      <div className="alert alert-info py-2 small mb-3">
        <strong>QR Verification:</strong> Downloading a certificate automatically saves it for QR code verification at <code>sgcsc.in/verify/&lt;certNo&gt;</code>.
        Certificates with a QR badge have been saved.
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-3 text-center">Loading certificates…</div>
          ) : filteredCertificates.length === 0 ? (
            <div className="p-3 text-center text-muted">
              No certificates found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Enrollment No</th>
                    <th>Certificate No</th>
                    <th>Grade</th>
                    <th>Issue Date</th>
                    <th>QR</th>
                    <th style={{ width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertificates.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <strong>{c.name}</strong>
                        <div className="small text-muted">
                          {c.fatherName && `S/o ${c.fatherName}`}
                        </div>
                      </td>
                      <td>{c.courseName}</td>
                      <td>{c.enrollmentNumber}</td>
                      <td>
                        <code>{c.certificateNumber}</code>
                      </td>
                      <td>
                        <span className="badge bg-success">{c.grade}</span>
                      </td>
                      <td>{fmtDate(c.issueDate)}</td>
                      <td>
                        {c.certificateImage ? (
                          <span
                            className="badge bg-success"
                            title="QR verification image saved"
                          >
                            Ready
                          </span>
                        ) : (
                          <span
                            className="badge bg-secondary"
                            title="Download PDF to enable QR verification"
                          >
                            Not saved
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-success me-1"
                          onClick={() => handleDownload(c)}
                          disabled={downloading === c._id}
                          title="Download PDF with QR code"
                        >
                          {downloading === c._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                              />
                              Generating…
                            </>
                          ) : (
                            "Download PDF"
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() =>
                            navigate(`/franchise/certificates/create?id=${c._id}`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(c._id)}
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
    </FranchiseLayout>
  );
}
