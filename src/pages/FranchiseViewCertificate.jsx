// src/pages/FranchiseViewCertificate.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

function fmtDate(d) {
  if (!d) return "N/A";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "N/A" : dt.toLocaleDateString("en-IN");
}

export default function FranchiseViewCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await API.get(`/franchise/certificates/${id}`);
        setCertificate(res.data);
      } catch (err) {
        console.error("fetchCertificate:", err);
        setError(err.userMessage || "Failed to fetch certificate details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCertificate();
    }
  }, [id]);

  if (loading) {
    return (
      <FranchiseLayout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
          <p className="mt-2">Loading certificate details...</p>
        </div>
      </FranchiseLayout>
    );
  }

  if (error || !certificate) {
    return (
      <FranchiseLayout>
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error || "Certificate not found"}
          <button type="button" className="btn-close" onClick={() => navigate("/franchise/certificates")} aria-label="Close"></button>
        </div>
        <div className="text-center py-5">
          <button className="btn btn-primary" onClick={() => navigate("/franchise/certificates")}>
            Back to Certificates
          </button>
        </div>
      </FranchiseLayout>
    );
  }

  const handleDownload = async () => {
    if (!window.CertificateGenerator) {
      setError("Certificate generator not loaded. Please refresh the page and try again.");
      return;
    }
    setDownloading(true);
    try {
      const certData = {
        ...certificate,
        studentNameCombined: certificate.fatherName
          ? `${certificate.name} S/O, D/O, W/O ${certificate.fatherName}`
          : (certificate.name || ""),
        centerName: certificate.centerName || certificate.atcName || "",
        dateOfIssue: certificate.issueDate || certificate.dateOfIssue || "",
        photo: certificate.photo || "",
      };
      if (window.CertificateGenerator.config?.templatePath) {
        await window.CertificateGenerator.loadTemplate(
          window.CertificateGenerator.config.templatePath
        );
      }
      await window.CertificateGenerator.download(certData);
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to generate certificate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <FranchiseLayout>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-0">Certificate Details</h2>
          <small className="text-muted">View certificate information</small>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-success"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? "Generating PDF…" : "Download PDF"}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/franchise/certificates/create?id=${id}`)}
          >
            Edit Certificate
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/franchise/certificates")}
          >
            Back to Certificates
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")} aria-label="Close"></button>
        </div>
      )}

      {/* Certificate Details Card */}
      <div className="card">
        <div className="card-body">
          <div className="row">
            {/* Student Info */}
            <div className="col-md-6 mb-3">
              <h6 className="border-bottom pb-2 mb-3">Student Information</h6>
              <p className="mb-1"><strong>Name:</strong> {certificate.name || "N/A"}</p>
              <p className="mb-1"><strong>Enrollment Number:</strong> {certificate.enrollmentNumber || "N/A"}</p>
              <p className="mb-1"><strong>Father's Name:</strong> {certificate.fatherName || "N/A"}</p>
              <p className="mb-1"><strong>Course:</strong> {certificate.courseName || "N/A"}</p>
            </div>

            {/* Certificate Info */}
            <div className="col-md-6 mb-3">
              <h6 className="border-bottom pb-2 mb-3">Certificate Information</h6>
              <p className="mb-1"><strong>Certificate Number:</strong> {certificate.certificateNumber || "N/A"}</p>
              <p className="mb-1"><strong>Issue Date:</strong> {fmtDate(certificate.issueDate)}</p>
              <p className="mb-1"><strong>Grade:</strong> {certificate.grade || "N/A"}</p>
              <p className="mb-1"><strong>Center / ATC:</strong> {certificate.centerName || certificate.atcName || "N/A"}</p>
            </div>

            {/* Additional Details */}
            <div className="col-12 mb-3">
              <h6 className="border-bottom pb-2 mb-3">Additional Details</h6>
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Session:</strong>{" "}
                    {certificate.sessionFrom && certificate.sessionTo
                      ? `${certificate.sessionFrom}–${certificate.sessionTo}`
                      : "N/A"}
                  </p>
                  <p className="mb-1"><strong>Course Duration:</strong> {certificate.courseDuration || "N/A"}</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Course Period:</strong>{" "}
                    {certificate.coursePeriodFrom && certificate.coursePeriodTo
                      ? `${fmtDate(certificate.coursePeriodFrom)} - ${fmtDate(certificate.coursePeriodTo)}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FranchiseLayout>
  );
}